import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { readEvents, subscribeToEvents } from '../tools/trace'
import type { ToolEvent } from '../tools/trace'
import { parseSchema } from './types'
import { useSurfaceSource, useToolSurface } from './useTool'

const GHOST_MS = 1100
const FLASH_MS = 1100
const LOG_SHOWN = 40

/**
 * Live view of the tool surface exactly as an agent sees it, plus the log of
 * what the agent actually did.
 *
 * Two tabs, one panel — *what the agent can do* and *what the agent did* — per
 * plan/04-observability.md. The surface tab flashes tools in when they register
 * and lingers them struck-through when they unregister, so a viewer can watch
 * the surface follow the human's selection instead of taking our word for it.
 * The log tab is the Phase 6 addition: when a call appears to do nothing, the
 * trace id, the duration and the truncated input and output are right there
 * rather than in a devtools session.
 *
 * Colours read through `var(--panel-*)` with dark fallbacks, so the panel picks
 * up the app's palette without hardcoding it and still renders standalone.
 */
export function ToolSurfacePanel({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const tools = useToolSurface()
  const source = useSurfaceSource()
  const supported = source === 'webmcp'
  const [open, setOpen] = useState(defaultOpen)
  const [tab, setTab] = useState<'surface' | 'log'>('surface')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [ghosts, setGhosts] = useState<string[]>([])
  const prevNames = useRef<string[]>([])

  useEffect(() => {
    const names = tools.map((t) => t.name)
    const before = prevNames.current
    prevNames.current = names

    const added = names.filter((n) => !before.includes(n))
    const removed = before.filter((n) => !names.includes(n))

    if (added.length) {
      setFresh((s) => new Set([...s, ...added]))
      const id = setTimeout(() => {
        setFresh((s) => {
          const next = new Set(s)
          added.forEach((n) => next.delete(n))
          return next
        })
      }, FLASH_MS)
      return () => clearTimeout(id)
    }
    if (removed.length) {
      setGhosts((g) => [...g, ...removed])
      const id = setTimeout(() => {
        setGhosts((g) => g.filter((n) => !removed.includes(n)))
      }, GHOST_MS)
      return () => clearTimeout(id)
    }
  }, [tools])

  return (
    <aside style={S.panel} aria-label="Agent tool surface" data-testid="tool-surface">
      <button style={S.header} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span style={S.dot(supported)} aria-hidden />
        <span style={S.title}>Agent tool surface</span>
        <span style={S.count}>{tools.length}</span>
        <span style={S.chevron(open)} aria-hidden>›</span>
      </button>

      {open && (
        <>
          <div style={S.tabs} role="tablist" aria-label="Panel view">
            <button
              style={S.tab(tab === 'surface')}
              role="tab"
              aria-selected={tab === 'surface'}
              onClick={() => setTab('surface')}
              data-testid="panel-tab-surface"
            >
              Surface
            </button>
            <button
              style={S.tab(tab === 'log')}
              role="tab"
              aria-selected={tab === 'log'}
              onClick={() => setTab('log')}
              data-testid="panel-tab-log"
            >
              Event log
            </button>
          </div>

          <div style={S.body}>
            {tab === 'surface' ? (
              <SurfaceTab
                tools={tools}
                supported={supported}
                fresh={fresh}
                ghosts={ghosts}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            ) : (
              <LogTab />
            )}
          </div>
        </>
      )}
    </aside>
  )
}

function SurfaceTab({
  tools,
  supported,
  fresh,
  ghosts,
  expanded,
  setExpanded,
}: {
  tools: ReturnType<typeof useToolSurface>
  supported: boolean
  fresh: Set<string>
  ghosts: string[]
  expanded: string | null
  setExpanded: (name: string | null) => void
}) {
  return (
    <>
      {!supported && (
        <p style={S.empty}>
          WebMCP is off in this browser, so these tools are served through the bridge
          instead: <code style={S.inlineCode}>window.__td</code>. Any agent that can run
          JavaScript here — Claude included — can call them.
        </p>
      )}

      {tools.length === 0 && ghosts.length === 0 && (
        <p style={S.empty}>No tools registered right now.</p>
      )}

      <ul style={S.list}>
        {tools.map((tool) => {
          const isNew = fresh.has(tool.name)
          const isOpen = expanded === tool.name
          return (
            <li key={tool.name} style={S.item(isNew)} data-testid={`tool-row-${tool.name}`}>
              <button
                style={S.itemBtn}
                onClick={() => setExpanded(isOpen ? null : tool.name)}
                aria-expanded={isOpen}
              >
                <code style={S.name}>{tool.name}</code>
                {isNew && <span style={S.badge}>new</span>}
              </button>
              {isOpen && (
                <div style={S.detail}>
                  <p style={S.desc}>{tool.description}</p>
                  <pre style={S.schema}>
                    {JSON.stringify(parseSchema(tool.inputSchema), null, 2)}
                  </pre>
                </div>
              )}
            </li>
          )
        })}

        {ghosts.map((name) => (
          <li key={`ghost-${name}`} style={S.ghost}>
            <code style={S.name}>{name}</code>
            <span style={S.badgeGone}>removed</span>
          </li>
        ))}
      </ul>
    </>
  )
}

/**
 * The event log, newest first.
 *
 * `readEvents` reads the `td:events` ring buffer straight out of
 * `localStorage`, and `subscribeToEvents` fires on every recorded call, so this
 * needs no store of its own — one `useSyncExternalStore` over the same wrapper
 * every executor already goes through.
 */
function LogTab() {
  const events = useSyncExternalStore(subscribeToEvents, readEvents, () => EMPTY)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (events.length === 0) {
    return (
      <p style={S.empty}>
        No tool calls yet. Every call is recorded here with its trace id, so a call that
        appears to do nothing can still be accounted for.
      </p>
    )
  }

  return (
    <ul style={S.list} data-testid="event-log">
      {events.slice(0, LOG_SHOWN).map((event) => {
        const isOpen = expanded === event.traceId
        return (
          <li key={event.traceId} style={S.item(false)} data-testid={`event-${event.traceId}`}>
            <button
              style={S.itemBtn}
              onClick={() => setExpanded(isOpen ? null : event.traceId)}
              aria-expanded={isOpen}
            >
              <span style={S.dot(event.ok)} aria-hidden />
              <code style={S.name}>{event.tool}</code>
              <span style={S.ms}>{event.durationMs}ms</span>
            </button>
            {isOpen && (
              <div style={S.detail}>
                <p style={S.desc}>
                  <code style={S.inlineCode}>{event.traceId}</code> · {clock(event.at)}
                  {event.network
                    ? ` · ${event.network.endpoint} ${event.network.status} ${event.network.source}`
                    : ''}
                </p>
                {event.error && <p style={S.err}>{event.error}</p>}
                <pre style={S.schema}>{`in  ${json(event.input)}\nout ${json(event.output)}`}</pre>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

const EMPTY: ToolEvent[] = []

/** Wall-clock only. The date is never the question when the log holds 200 rows. */
function clock(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toTimeString().slice(0, 8)
}

function json(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return '[unserialisable]'
  }
}

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace'

const S = {
  panel: {
    position: 'fixed' as const,
    right: 16,
    bottom: 16,
    width: 300,
    maxHeight: '70vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'var(--panel-bg, #14181f)',
    color: 'var(--panel-fg, #e7ebf1)',
    border: '1px solid var(--panel-line, #2a323d)',
    borderRadius: 12,
    boxShadow: '0 12px 40px -16px rgba(11,28,48,0.28)',
    fontFamily: MONO,
    fontSize: 12,
    zIndex: 900,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: 0,
    borderBottom: '1px solid var(--panel-line, #2a323d)',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  tabs: {
    display: 'flex',
    gap: 2,
    padding: 6,
    borderBottom: '1px solid var(--panel-line, #2a323d)',
  },
  tab: (current: boolean) => ({
    flex: 1,
    padding: '5px 8px',
    borderRadius: 6,
    border: 0,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 10.5,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    background: current ? 'var(--panel-line, #2a323d)' : 'transparent',
    color: current ? 'var(--panel-fg, #e7ebf1)' : 'inherit',
    opacity: current ? 1 : 0.6,
  }),
  dot: (ok: boolean) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: ok ? 'var(--panel-accent, #35cdbc)' : 'var(--panel-danger, #f0817e)',
    flexShrink: 0,
  }),
  title: { flex: 1, letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontSize: 10.5 },
  count: {
    color: 'var(--panel-warn, #f0a227)',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums' as const,
  },
  chevron: (open: boolean) => ({
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 140ms ease',
    opacity: 0.5,
    display: 'inline-block',
  }),
  body: { overflowY: 'auto' as const, padding: 6 },
  empty: { margin: 0, padding: '10px 8px', opacity: 0.7, lineHeight: 1.5 },
  inlineCode: { fontFamily: MONO, color: 'var(--panel-warn, #f0a227)', background: 'transparent' },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  item: (isNew: boolean) => ({
    borderRadius: 6,
    background: isNew ? 'var(--panel-flash, rgba(53,205,188,0.16))' : 'transparent',
    transition: 'background 420ms ease',
  }),
  itemBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    width: '100%',
    padding: '6px 8px',
    background: 'transparent',
    border: 0,
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  name: { fontFamily: MONO, fontSize: 12, background: 'transparent', flex: 1, minWidth: 0 },
  ms: { fontSize: 10.5, opacity: 0.6, fontVariantNumeric: 'tabular-nums' as const },
  badge: {
    fontSize: 9,
    letterSpacing: '0.08em',
    color: 'var(--panel-accent, #35cdbc)',
    textTransform: 'uppercase' as const,
  },
  badgeGone: {
    fontSize: 9,
    letterSpacing: '0.08em',
    color: 'var(--panel-danger, #f0817e)',
    textTransform: 'uppercase' as const,
  },
  ghost: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 8px',
    opacity: 0.45,
    textDecoration: 'line-through',
  },
  detail: { padding: '0 8px 8px', display: 'flex', flexDirection: 'column' as const, gap: 6 },
  desc: { margin: 0, opacity: 0.75, lineHeight: 1.5, fontSize: 11 },
  err: { margin: 0, color: 'var(--panel-danger, #f0817e)', lineHeight: 1.5, fontSize: 11 },
  schema: {
    margin: 0,
    padding: 8,
    background: 'var(--panel-well, rgba(0,0,0,0.28))',
    borderRadius: 6,
    overflowX: 'auto' as const,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    fontSize: 10.5,
    lineHeight: 1.5,
  },
}
