/**
 * Calendar — a month grid that places briefs on days.
 *
 * Two tools register here and nowhere else (`schedule_brief`, `list_schedule`),
 * which is Phase 5 exit criterion 2: the surface is exactly 4 on this route.
 *
 * **Drag and drop is deliberately absent.** plan/phases/phase-5 cuts it by
 * name: it is an hour of pointer-event handling for something a click already
 * delivers, and it does not record on video any better. Clicking a day opens
 * the assign form; that is the whole interaction.
 *
 * Every field the agent can write is hand-editable here, per the constraint in
 * plan/README.md — a judge with no agent connected schedules a brief by hand
 * and sees the same entry the tool would have made, because both go through
 * `scheduleBrief()` in the store.
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import { briefStore } from '../store/briefs'
import { PlatformIcon } from '../components/PlatformIcon'
import { dispatch, navigate } from '../store/router'
import {
  scheduleBrief,
  scheduleStore,
  setScheduleStatus,
  unschedule,
} from '../store/schedule'
import { UNASSIGNED_PIC, calendarRouteTools } from '../tools/schedule'
import { useTools } from '../webmcp'
import { PLATFORMS, SCHEDULE_STATUSES } from '../types'
import type { Brief, Platform, ScheduleEntry, ScheduleStatus } from '../types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Monday-first, because a content calendar is a work week. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  planned: 'planned',
  in_progress: 'in progress',
  published: 'published',
}

type ContentPlan = {
  id: string
  day: number
  title: string
  platform: Platform
  status: ScheduleStatus
  time: string
}

/** Editorial planning cards decorate the calendar without writing to the schedule store. */
const CONTENT_PLANS: ContentPlan[] = [
  { id: 'barrier-myth', day: 3, title: 'Barrier repair myth check', platform: 'tiktok', status: 'planned', time: '18:30' },
  { id: 'routine-reset', day: 6, title: 'Routine reset carousel', platform: 'instagram', status: 'in_progress', time: '10:00' },
  { id: 'ratio-guide', day: 10, title: 'Cold brew ratio guide', platform: 'youtube', status: 'planned', time: '17:00' },
  { id: 'creator-note', day: 14, title: 'Creator insight thread', platform: 'x', status: 'published', time: '09:15' },
  { id: 'night-shift', day: 18, title: 'Night shift skin ritual', platform: 'instagram', status: 'planned', time: '19:00' },
  { id: 'product-myth', day: 22, title: 'Product myth, explained', platform: 'tiktok', status: 'in_progress', time: '12:30' },
]

/**
 * ISO day built from numbers, never from `Date.toISOString()`.
 *
 * `new Date(y, m, d).toISOString()` is UTC, so for anyone east of Greenwich —
 * including WITA, where this is being built — every cell would render the day
 * before. Formatting arithmetically removes the timezone from the question
 * entirely.
 */
function isoDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayIso(): string {
  const now = new Date()
  return isoDay(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Days in a month, and the Monday-first column its 1st falls in. */
function monthShape(year: number, month: number): { days: number; offset: number } {
  const days = new Date(year, month + 1, 0).getDate()
  const sundayFirst = new Date(year, month, 1).getDay()
  return { days, offset: (sundayFirst + 6) % 7 }
}

export function Calendar() {
  const briefs = briefStore.use()
  const entries = scheduleStore.use()

  useTools(calendarRouteTools())

  const today = todayIso()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const { days, offset } = monthShape(cursor.year, cursor.month)
  const monthPrefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`
  const inMonth = entries.filter((entry) => entry.date.startsWith(monthPrefix))
  const outOfMonth = entries.filter((entry) => !entry.date.startsWith(monthPrefix))

  const byDate = new Map<string, ScheduleEntry[]>()
  inMonth.forEach((entry) => {
    const list = byDate.get(entry.date) ?? []
    list.push(entry)
    byDate.set(entry.date, list)
  })

  const plansByDay = new Map<number, ContentPlan[]>()
  CONTENT_PLANS.forEach((plan) => {
    const list = plansByDay.get(plan.day) ?? []
    list.push(plan)
    plansByDay.set(plan.day, list)
  })

  const byPlatform = new Map<Platform, number>()
  CONTENT_PLANS.forEach((plan) => byPlatform.set(plan.platform, (byPlatform.get(plan.platform) ?? 0) + 1))
  const channelBreakdown = [...byPlatform.entries()]

  const step = (delta: number) => {
    const next = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: next.getFullYear(), month: next.getMonth() })
    setSelectedDay(null)
  }

  const jumpTo = (date: string) => {
    const [year, month] = date.split('-').map(Number)
    setCursor({ year, month: month - 1 })
    setSelectedDay(date)
  }

  return (
    <>
      <div className="calendar-layout">
      <section className="card calendar-main-card" data-testid="calendar">
        <div className="card-head">
          <h2>Calendar</h2>
          <span className="muted small" data-testid="calendar-count">
            {CONTENT_PLANS.length} content plans · {inMonth.length} scheduled
          </span>
          <div className="toggle" role="group" aria-label="Month">
            <button type="button" className="chip" data-testid="calendar-prev" onClick={() => step(-1)}>
              ‹ prev
            </button>
            <button
              type="button"
              className="chip"
              data-testid="calendar-today"
              onClick={() => {
                const now = new Date()
                setCursor({ year: now.getFullYear(), month: now.getMonth() })
                setSelectedDay(today)
              }}
            >
              today
            </button>
            <button type="button" className="chip" data-testid="calendar-next" onClick={() => step(1)}>
              next ›
            </button>
          </div>
        </div>

        <p className="eyebrow" data-testid="calendar-month">
          {MONTHS[cursor.month]} {cursor.year}
        </p>

        <div className="calendar-grid" data-testid="calendar-grid">
          {WEEKDAYS.map((name) => (
            <div key={name} className="calendar-weekday" aria-hidden="true">
              {name}
            </div>
          ))}

          {Array.from({ length: offset }, (_, i) => (
            <div key={`pad-${i}`} className="calendar-cell is-pad" aria-hidden="true" />
          ))}

          {Array.from({ length: days }, (_, i) => {
            const date = isoDay(cursor.year, cursor.month, i + 1)
            const dayEntries = byDate.get(date) ?? []
            const dayPlans = plansByDay.get(i + 1) ?? []
            return (
              <button
                type="button"
                key={date}
                className={
                  'calendar-cell' +
                  (date === today ? ' is-today' : '') +
                  (date === selectedDay ? ' is-selected' : '')
                }
                data-testid={`calendar-day-${date}`}
                aria-pressed={date === selectedDay}
                onClick={() => setSelectedDay(date === selectedDay ? null : date)}
              >
                <span className="calendar-daynum">{i + 1}</span>
                {dayEntries.map((entry) => (
                  <span
                    key={entry.id}
                    className={`sched-chip sched-${entry.status}`}
                    data-testid={`schedule-chip-${entry.id}`}
                  >
                    {briefs.find((b) => b.id === entry.briefId)?.title ?? entry.briefId}
                  </span>
                ))}
                {dayPlans.map((plan) => (
                  <span key={plan.id} className={`calendar-plan plan-${plan.status}`} data-testid={`calendar-plan-${plan.id}`}>
                    <span className="calendar-plan-meta"><PlatformIcon platform={plan.platform} size={13} /><span>{plan.time}</span><span>{STATUS_LABEL[plan.status]}</span></span>
                    <span className="calendar-plan-title">{plan.title}</span>
                  </span>
                ))}
              </button>
            )
          })}
        </div>

        {outOfMonth.length > 0 && (
          <p className="muted small" data-testid="calendar-elsewhere">
            {outOfMonth.length} entr{outOfMonth.length === 1 ? 'y is' : 'ies are'} outside{' '}
            {MONTHS[cursor.month]}:{' '}
            {outOfMonth
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="link"
                  data-testid={`calendar-jump-${entry.id}`}
                  onClick={() => jumpTo(entry.date)}
                >
                  {entry.date}
                </button>
              ))
              .reduce<ReactNode[]>((acc, node, i) => (i === 0 ? [node] : [...acc, ', ', node]), [])}
          </p>
        )}
      </section>

      <aside className="calendar-insights" data-testid="calendar-insights" aria-label="Calendar insights">
        <section className="card calendar-insight-card">
          <div className="calendar-insight-head"><h3>Monthly capacity</h3><span>{Math.round(CONTENT_PLANS.length / 16 * 100)}% planned</span></div>
          <strong className="calendar-capacity">{CONTENT_PLANS.length}<small>/ 16 slots</small></strong>
          <span className="calendar-capacity-bar"><i style={{ width: `${CONTENT_PLANS.length / 16 * 100}%` }} /></span>
          <p className="muted small">{16 - CONTENT_PLANS.length} open slots this month</p>
        </section>

        <section className="card calendar-insight-card">
          <h3>Channel plan</h3>
          <ul className="calendar-channel-list">
            {channelBreakdown.map(([platform, count]) => <li key={platform}><span><PlatformIcon platform={platform} size={15} />{platform}</span><strong>{count} post{count === 1 ? '' : 's'}</strong></li>)}
          </ul>
        </section>

        <section className="card calendar-insight-card">
          <h3>Upcoming</h3>
          <ul className="calendar-upcoming-list">
            {CONTENT_PLANS.slice(0, 3).map((plan) => <li key={plan.id}><PlatformIcon platform={plan.platform} size={15} /><span><strong>{plan.title}</strong><small>{MONTHS[cursor.month].slice(0, 3)} {plan.day} · {plan.time}</small></span></li>)}
          </ul>
        </section>
      </aside>
      </div>

      <section className="card" data-testid="schedule-day">
        <div className="card-head">
          <h2>{selectedDay ? `Day — ${selectedDay}` : 'Pick a day'}</h2>
        </div>
        {selectedDay === null ? (
          <p className="muted" data-testid="schedule-day-empty">
            Click a day above to assign a brief to it, or ask a connected agent — the same write
            goes through <code>schedule_brief</code>, which is idempotent by brief and date, so a
            retry updates the slot instead of stacking a second chip on it.
          </p>
        ) : (
          <DayPanel date={selectedDay} briefs={briefs} entries={byDate.get(selectedDay) ?? []} />
        )}
      </section>
    </>
  )
}

function DayPanel({ date, briefs, entries }: { date: string; briefs: Brief[]; entries: ScheduleEntry[] }) {
  const [briefId, setBriefId] = useState('')
  const [platform, setPlatform] = useState<Platform | ''>('')
  const [pic, setPic] = useState('')
  const [status, setStatus] = useState<ScheduleStatus>('planned')
  const [note, setNote] = useState<string | null>(null)

  const brief = briefs.find((b) => b.id === briefId) ?? null

  function assign() {
    if (!brief) return
    const result = scheduleBrief({
      briefId: brief.id,
      date,
      platform: platform || brief.platform,
      pic: pic.trim() || UNASSIGNED_PIC,
      status,
    })
    setNote(
      result.created
        ? `Scheduled ${brief.title}.`
        : result.changed.length === 0
          ? `${brief.title} was already on ${date} with these values — nothing changed.`
          : `${brief.title} was already on ${date}; updated ${result.changed.join(', ')}.`,
    )
    setBriefId('')
    setPlatform('')
    setPic('')
    setStatus('planned')
  }

  return (
    <>
      {entries.length === 0 ? (
        <p className="muted small" data-testid="schedule-day-none">
          Nothing scheduled on {date} yet.
        </p>
      ) : (
        <ul className="rows" data-testid="schedule-list">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              title={briefs.find((b) => b.id === entry.briefId)?.title ?? entry.briefId}
            />
          ))}
        </ul>
      )}

      {briefs.length > 0 && (
        <div className="schedule-form" data-testid="schedule-form">
          <label className="field">
            <span className="field-label">Brief</span>
            <select
              data-testid="schedule-brief"
              value={briefId}
              onChange={(e) => setBriefId(e.target.value)}
            >
              <option value="">Select a brief…</option>
              {briefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} · {b.status}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Platform</span>
            <select
              data-testid="schedule-platform"
              value={platform || brief?.platform || ''}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              disabled={!brief}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">PIC</span>
            <input
              data-testid="schedule-pic"
              value={pic}
              placeholder={UNASSIGNED_PIC}
              onChange={(e) => setPic(e.target.value)}
              disabled={!brief}
            />
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <select
              data-testid="schedule-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
              disabled={!brief}
            >
              {SCHEDULE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn-primary"
            data-testid="schedule-assign"
            disabled={!brief}
            onClick={assign}
          >
            Assign to {date}
          </button>
        </div>
      )}

      {note && (
        <p className="muted small" data-testid="schedule-note">
          {note}
        </p>
      )}
    </>
  )
}

function EntryRow({ entry, title }: { entry: ScheduleEntry; title: string }) {
  return (
    <li className="row" data-testid={`schedule-entry-${entry.id}`}>
      <div className="row-main">
        <span className="row-title">
          <button
            type="button"
            className="link"
            data-testid={`schedule-brief-link-${entry.id}`}
            onClick={() => {
              dispatch({ type: 'openBrief', briefId: entry.briefId })
              navigate('briefs')
            }}
          >
            {title}
          </button>
        </span>
        <span className="muted small">
          {entry.platform} · {entry.pic}
        </span>
      </div>

      <span
        className={`status sched-${entry.status}`}
        data-testid={`schedule-status-${entry.id}`}
      >
        {STATUS_LABEL[entry.status]}
      </span>

      <div className="status-actions">
        {SCHEDULE_STATUSES.filter((s) => s !== entry.status).map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            data-testid={`schedule-action-${entry.id}-${s}`}
            onClick={() => setScheduleStatus(entry.id, s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
        <button
          type="button"
          className="chip"
          data-testid={`schedule-remove-${entry.id}`}
          onClick={() => unschedule(entry.id)}
        >
          remove
        </button>
      </div>
    </li>
  )
}
