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
  contentType: 'Educating' | 'Entertaining' | 'Promotional' | 'Community'
  angle: string
  goal: string
}

/** Editorial planning cards decorate the calendar without writing to the schedule store. */
const CONTENT_PLANS: ContentPlan[] = [
  { id: 'morning-ritual', day: 2, title: 'A calm morning skin ritual', platform: 'instagram', status: 'published', time: '08:30', contentType: 'Community', angle: 'Invite the audience to share their smallest, most consistent morning step.', goal: 'Build conversation' },
  { id: 'barrier-myth', day: 3, title: 'Barrier repair myth check', platform: 'tiktok', status: 'planned', time: '18:30', contentType: 'Educating', angle: 'Debunk the idea that stinging means a product is working.', goal: 'Build trust' },
  { id: 'spf-texture', day: 4, title: 'The no-pilling SPF check', platform: 'tiktok', status: 'planned', time: '12:00', contentType: 'Entertaining', angle: 'Show the sunscreen texture test under makeup in one quick take.', goal: 'Drive discovery' },
  { id: 'routine-reset', day: 6, title: 'Routine reset carousel', platform: 'instagram', status: 'in_progress', time: '10:00', contentType: 'Educating', angle: 'Frame a simple three-step reset for reactive-skin days.', goal: 'Save-worthy education' },
  { id: 'ingredient-note', day: 8, title: 'Ingredients that keep routines calm', platform: 'x', status: 'published', time: '09:15', contentType: 'Educating', angle: 'Explain why fewer familiar ingredients can feel more reassuring.', goal: 'Build authority' },
  { id: 'layering-guide', day: 10, title: 'SPF layering guide', platform: 'youtube', status: 'planned', time: '17:00', contentType: 'Educating', angle: 'Walk through moisturiser, serum, and SPF order without overcomplicating it.', goal: 'Teach routines' },
  { id: 'desk-dryness', day: 12, title: 'Desk-side dryness check', platform: 'instagram', status: 'planned', time: '15:30', contentType: 'Community', angle: 'Ask followers where their skin feels driest during the workday.', goal: 'Start conversation' },
  { id: 'creator-note', day: 14, title: 'Creator insight thread', platform: 'x', status: 'published', time: '09:15', contentType: 'Community', angle: 'Share a behind-the-scenes note about making skincare feel less intimidating.', goal: 'Humanise the brand' },
  { id: 'serum-pairing', day: 16, title: 'How to pair a barrier serum', platform: 'youtube', status: 'planned', time: '18:00', contentType: 'Promotional', angle: 'Demonstrate the serum as a gentle support step, not a miracle fix.', goal: 'Drive product discovery' },
  { id: 'night-shift', day: 18, title: 'Night shift skin ritual', platform: 'instagram', status: 'planned', time: '19:00', contentType: 'Educating', angle: 'Offer a low-effort routine for skin that feels tired after a long day.', goal: 'Help routine beginners' },
  { id: 'texture-poll', day: 20, title: 'Which texture feels right?', platform: 'tiktok', status: 'planned', time: '11:30', contentType: 'Entertaining', angle: 'Use a quick side-by-side texture poll to invite a simple choice.', goal: 'Increase engagement' },
  { id: 'product-myth', day: 22, title: 'Product myth, explained', platform: 'tiktok', status: 'in_progress', time: '12:30', contentType: 'Educating', angle: 'Answer the question: does a minimal routine still work?', goal: 'Build trust' },
  { id: 'sun-care', day: 24, title: 'Sunscreen that feels like skincare', platform: 'instagram', status: 'planned', time: '09:00', contentType: 'Promotional', angle: 'Focus on the comfortable daily feel of Daily Cloud SPF 50.', goal: 'Drive consideration' },
  { id: 'weekend-reset', day: 26, title: 'Weekend routine reset', platform: 'instagram', status: 'planned', time: '10:30', contentType: 'Community', angle: 'Share a soft reset prompt the audience can adapt to their own routine.', goal: 'Build connection' },
  { id: 'sensitive-skin', day: 28, title: 'Sensitive skin: less can be more', platform: 'youtube', status: 'planned', time: '16:00', contentType: 'Educating', angle: 'Explain the role of consistency when skin feels reactive.', goal: 'Teach routines' },
  { id: 'month-recap', day: 30, title: 'September skin moments recap', platform: 'tiktok', status: 'planned', time: '18:30', contentType: 'Entertaining', angle: 'Recap the month’s most saved calm-skin ideas in a quick montage.', goal: 'Celebrate community' },
]

const MONTHLY_CAPACITY = 20

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
  const selectedPlans = selectedDay ? plansByDay.get(Number(selectedDay.slice(-2))) ?? [] : []

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
          <div className="calendar-insight-head"><h3>Monthly capacity</h3><span>{Math.round(CONTENT_PLANS.length / MONTHLY_CAPACITY * 100)}% planned</span></div>
          <strong className="calendar-capacity">{CONTENT_PLANS.length}<small>/ {MONTHLY_CAPACITY} slots</small></strong>
          <span className="calendar-capacity-bar"><i style={{ width: `${CONTENT_PLANS.length / MONTHLY_CAPACITY * 100}%` }} /></span>
          <p className="muted small">{MONTHLY_CAPACITY - CONTENT_PLANS.length} open slots this month</p>
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
          <h2>{selectedDay ? `Content for ${formatCalendarDate(selectedDay)}` : 'Content plan'}</h2>
        </div>
        {selectedDay === null ? (
          <p className="muted" data-testid="schedule-day-empty">
            Select a date to view its content plan, publishing details, and the next best idea for that day.
          </p>
        ) : (
          <DayPanel date={selectedDay} briefs={briefs} entries={byDate.get(selectedDay) ?? []} plans={selectedPlans} />
        )}
      </section>
    </>
  )
}

function formatCalendarDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

function DayPanel({ date, briefs, entries, plans }: { date: string; briefs: Brief[]; entries: ScheduleEntry[]; plans: ContentPlan[] }) {
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
      {plans.length > 0 ? (
        <div className="calendar-content-details" data-testid="calendar-content-details">
          {plans.map((plan) => (
            <article key={plan.id} className="calendar-content-detail" data-testid={`calendar-detail-${plan.id}`}>
              <div className="calendar-content-detail-top"><span className={`content-type content-type-${plan.contentType.toLowerCase()}`}>{plan.contentType}</span><span className={`status status-${plan.status}`}>{STATUS_LABEL[plan.status]}</span></div>
              <h3>{plan.title}</h3>
              <p>{plan.angle}</p>
              <div className="calendar-detail-facts"><span><PlatformIcon platform={plan.platform} size={16} />{plan.time}</span><span>{plan.goal}</span></div>
            </article>
          ))}
        </div>
      ) : (
        <article className="calendar-open-slot" data-testid="calendar-day-suggestion">
          <p className="eyebrow">Open creative slot</p>
          <h3>Share one small, reassuring skincare habit</h3>
          <p>A simple before-and-after routine moment works well here: keep the message calm, practical, and easy to save.</p>
          <div><span className="content-type">Educating</span><span className="content-type">Instagram carousel</span><span className="content-type">10:00</span></div>
        </article>
      )}

      {entries.length > 0 && (
        <section className="calendar-scheduled-briefs">
          <p className="library-section-label">Scheduled briefs</p>
          <ul className="rows" data-testid="schedule-list">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              title={briefs.find((b) => b.id === entry.briefId)?.title ?? entry.briefId}
            />
          ))}
          </ul>
        </section>
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
