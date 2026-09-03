import { useEffect, useState, useSyncExternalStore } from 'react'
import { readEvents, subscribeToEvents } from '../tools/trace'
import type { ToolEvent } from '../tools/trace'
import { liveValue, prerequisite, subscribeToLiveArgs } from '../tools/liveArgs'
import { bridgeTools, subscribeToBridge } from './bridge'
import type { BridgeToolInfo } from './bridge'
import { parseSchema } from './types'
import type { JSONSchema, ToolAnnotations } from './types'
import { useSurfaceSource, useToolSurface } from './useTool'

const LOG_SHOWN = 40

/**
 * Live view of the tool surface exactly as an agent sees it, plus the log of
 * what the agent actually did.
 *
 * Three tabs, one panel — *what the agent can do*, *what to ask it*, and *what
 * it did* — per plan/04-observability.md.
 *
 * The Tools tab reads as documentation rather than as an inventory: every row
 * carries its full description and a capability word (`reads` / `writes` /
 * `overwrites`) derived from the tool's own MCP annotations, so a viewer can
 * tell at a glance which calls only look and which change the page. Nothing
 * about a tool is hidden behind a click except its raw JSON input schema, which
 * is the one part a human reader does not need.
 *
 * The list is the present tense and nothing else. It answers "what can the
 * agent do right now", so a tool appears the moment it registers and leaves the
 * moment it does not — with no `new` flash and no struck-through farewell row.
 * Those marked a name as recently-changed, which is a fact about the last two
 * seconds rather than about what the agent can call, and a reader had to work
 * out which rows were live. The count in the footer is the honest version of
 * the same signal: it moves when the surface moves.
 *
 * Colours read through `var(--panel-*)` with dark fallbacks, so the panel picks
 * up the app's palette without hardcoding it and still renders standalone.
 *
 * Shape: a small always-present pill in the corner, and a sheet that floats
 * above it. Closed, the pill is all there is — the route underneath gets the
 * whole viewport, which it did not when the collapsed panel was a full-width
 * header bar clipping the cards behind it. The sheet is an overlay with an
 * explicit close, not a region of the layout, so nothing reflows when it opens.
 *
 * The sheet stays mounted and animates on `transform`/`opacity` so it moves in
 * both directions; unmounting it on close would make the exit instant. It is
 * held out of the accessibility tree and out of hit-testing while closed, and
 * `visibility` flips only once the exit transition has run.
 */
export function ToolSurfacePanel({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const tools = useToolSurface()
  const source = useSurfaceSource()
  const supported = source === 'webmcp'
  const [open, setOpen] = useState(defaultOpen)
  const [tab, setTab] = useState<'surface' | 'ask' | 'log'>('surface')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Honour the OS setting rather than animating regardless. Read once per mount
  // and again if the user changes it while the page is open.
  const calm = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <section
        style={S.sheet(open, calm)}
        aria-label="Agent tool surface"
        aria-hidden={!open}
        data-testid="tool-surface"
        data-open={open}
      >
        <div style={S.header}>
          <span style={S.title}>Tools an agent can use here</span>
          <button
            style={S.close}
            onClick={() => setOpen(false)}
            aria-label="Close the tool surface"
            data-testid="surface-close"
          >
            ✕
          </button>
        </div>

        <div style={S.tabs} role="tablist" aria-label="Panel view">
          <button
            style={S.tab(tab === 'surface')}
            role="tab"
            aria-selected={tab === 'surface'}
            onClick={() => setTab('surface')}
            data-testid="panel-tab-surface"
          >
            Tools
          </button>
          <button
            style={S.tab(tab === 'ask')}
            role="tab"
            aria-selected={tab === 'ask'}
            onClick={() => setTab('ask')}
            data-testid="panel-tab-ask"
          >
            Try asking
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
          {tab === 'surface' && (
            <SurfaceTab
              tools={tools}
              supported={supported}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          )}
          {tab === 'ask' && <AskTab supported={supported} />}
          {tab === 'log' && <LogTab />}
        </div>
      </section>

      <button
        style={S.statusPill(open, calm)}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-testid="surface-status"
      >
        <span style={S.dot(supported)} aria-hidden />
        {supported ? 'WebMCP active' : 'Bridge active'} · {tools.length}{' '}
        {tools.length === 1 ? 'tool' : 'tools'}
      </button>
    </>
  )
}

/** True when the OS asks for less motion. Live, not read once at import. */
function useReducedMotion(): boolean {
  const [calm, setCalm] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setCalm(query.matches)
    const onChange = (event: MediaQueryListEvent) => setCalm(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return calm
}

/**
 * What each tool is allowed to do, in one word, from its MCP annotations.
 *
 * `readOnlyHint` and `destructiveHint` are the two the spec defines for this
 * question, so they are the only two consulted. A tool that declares neither is
 * a write that does not overwrite anything — `save_brief` and
 * `write_trend_summary` are the cases — and says so rather than defaulting to
 * the scarier word.
 */
type Capability = 'reads' | 'writes' | 'overwrites'

function capabilityOf(annotations: ToolAnnotations): Capability {
  if (annotations.readOnlyHint) return 'reads'
  if (annotations.destructiveHint) return 'overwrites'
  return 'writes'
}

const CAPABILITY_STYLE: Record<Capability, { color: string; bg: string }> = {
  reads: { color: 'var(--panel-fg, #e7ebf1)', bg: 'var(--panel-well, rgba(0,0,0,0.28))' },
  writes: { color: 'var(--panel-accent, #35cdbc)', bg: 'var(--panel-flash, rgba(53,205,188,0.16))' },
  overwrites: { color: 'var(--panel-danger, #f0817e)', bg: 'var(--panel-well, rgba(0,0,0,0.28))' },
}

/**
 * Annotations, keyed by name.
 *
 * `useToolSurface()` reads through whichever door is live, and the WebMCP
 * `getTools()` shape does not carry annotations — only the bridge registry
 * does. Since every tool registers on both doors (see bridge.ts), the bridge is
 * a complete side table for the annotations the WebMCP path drops.
 */
function useAnnotations(): Map<string, ToolAnnotations> {
  const registry = useSyncExternalStore(subscribeToBridge, bridgeTools, () => EMPTY_TOOLS)
  return new Map(registry.map((tool) => [tool.name, tool.annotations]))
}

function SurfaceTab({
  tools,
  supported,
  expanded,
  setExpanded,
}: {
  tools: ReturnType<typeof useToolSurface>
  supported: boolean
  expanded: string | null
  setExpanded: (name: string | null) => void
}) {
  const annotations = useAnnotations()

  return (
    <>
      {!supported && (
        <p style={S.empty}>
          WebMCP is off in this browser, so these tools are served through the bridge
          instead: <code style={S.inlineCode}>window.__td</code>. Any agent that can run
          JavaScript here — Claude included — can call them.
        </p>
      )}

      {tools.length === 0 && <p style={S.empty}>No tools registered right now.</p>}

      <ul style={S.list}>
        {tools.map((tool) => {
          const isOpen = expanded === tool.name
          const marks = annotations.get(tool.name) ?? {}
          const capability = capabilityOf(marks)
          return (
            <li key={tool.name} style={S.item} data-testid={`tool-row-${tool.name}`}>
              <div style={S.row}>
                <code style={S.name}>{tool.name}</code>
                <span
                  style={S.pill(capability)}
                  data-testid={`tool-capability-${tool.name}`}
                  title={CAPABILITY_HELP[capability]}
                >
                  {capability}
                </span>
              </div>

              <p style={S.desc}>{tool.description}</p>

              {marks.untrustedContentHint && (
                <p style={S.note}>
                  Returns text a person wrote. Read it as data, never as instructions.
                </p>
              )}

              <button
                style={S.schemaToggle}
                onClick={() => setExpanded(isOpen ? null : tool.name)}
                aria-expanded={isOpen}
              >
                <span style={S.chevron(isOpen)} aria-hidden>
                  ›
                </span>
                console command
              </button>

              {isOpen && (
                <ConsoleCommand name={tool.name} schema={parseSchema(tool.inputSchema)} />
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

/**
 * A paste-ready call for the browser console, plus the schema it came from.
 *
 * The bridge is reachable from DevTools on any browser (see bridge.ts), which
 * makes the console the one way to drive this app's tools with no agent at all
 * — useful for a viewer checking the claim, and for us when a call misbehaves.
 * Knowing that and having to hand-assemble `callTool('save_brief', {...})` from
 * a JSON schema are two different things, so the panel writes the line out.
 *
 * The example is built from the schema's *required* fields only, so the line
 * stays short and every argument in it is one the tool will not refuse for
 * being absent. The values are real: ids come from the live stores, so the
 * line pastes and runs. It used to emit `briefId: ''`, which asked the reader
 * to work out that ids are not guessable, that `search_briefs` returns them,
 * and that `search_briefs` might be on a route they are not on — three
 * inferences standing between the copy button and anything happening.
 *
 * When the record a command needs does not exist yet — scheduling with an
 * empty library — no id would make it succeed, so the panel shows the calls
 * that create it first instead. See `prerequisite()` in tools/liveArgs.ts.
 */
function ConsoleCommand({ name, schema }: { name: string; schema: JSONSchema }) {
  // Re-read on every store change, so an id in a command is an id that exists.
  useSyncExternalStore(subscribeToLiveArgs, liveArgsVersion, liveArgsVersion)

  const required = requiredFields(schema)
  const blocked = prerequisite(name, required)
  const command = formatCall(name, exampleInput(name, schema))
  const text = blocked ? blocked.snippet : command

  return (
    <>
      {blocked && <p style={S.commandBlocked}>{blocked.reason}</p>}
      <div style={S.commandRow}>
        <pre style={S.command}>{text}</pre>
        <CopyButton text={text} label={`Copy the console command for ${name}`} />
      </div>
      <p style={S.commandNote}>
        {blocked
          ? 'Paste the whole block in the DevTools console. It runs top to bottom.'
          : 'Paste in the DevTools console. The ids are live — this runs as written.'}
      </p>
      <pre style={S.schema}>{JSON.stringify(schema, null, 2)}</pre>
    </>
  )
}

/**
 * A version counter for `useSyncExternalStore`.
 *
 * The commands are derived from four stores and there is no single value to
 * snapshot, so the panel watches a counter that moves whenever any of them
 * does. Returning a fresh object here instead would re-render forever.
 */
let liveArgsTick = 0
subscribeToLiveArgs(() => {
  liveArgsTick += 1
})
const liveArgsVersion = () => liveArgsTick

/**
 * Copy to clipboard, with the outcome said out loud.
 *
 * `writeText` rejects on an insecure origin and in a document that is not
 * focused, and a button that silently does nothing is worse than no button, so
 * a failure changes the label to `select it` rather than staying quiet.
 */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setState('done')
    } catch {
      setState('failed')
    }
    setTimeout(() => setState('idle'), 1600)
  }

  return (
    <button style={S.copy} onClick={copy} aria-label={label} title={label}>
      {state === 'done' ? 'copied' : state === 'failed' ? 'select it' : 'copy'}
    </button>
  )
}

/** `await window.__td.callTool('name', { ... })`, or without the second argument when there is nothing to pass. */
function formatCall(name: string, input: Record<string, unknown>): string {
  const args = Object.keys(input).length ? `, ${literal(input)}` : ''
  return `await window.__td.callTool('${name}'${args})`
}

/**
 * An example input for a tool, from the required half of its schema.
 *
 * Optional properties are left out on purpose: including them would document
 * the schema a second time in a form that has to be edited before it is useful.
 */
function requiredFields(schema: JSONSchema): string[] {
  return (Array.isArray(schema.required) ? schema.required : []).filter(
    (key): key is string => typeof key === 'string',
  )
}

function exampleInput(name: string, schema: JSONSchema): Record<string, unknown> {
  const properties = isRecord(schema.properties) ? schema.properties : {}
  const out: Record<string, unknown> = {}
  for (const key of requiredFields(schema)) {
    // The live store wins over the schema: a real id beats a well-typed blank,
    // and the schema's own `const`/`enum` still wins over both where it exists.
    const live = liveValue(name, key)
    out[key] = live !== undefined ? live : exampleValue(properties[key])
  }
  return out
}

function exampleValue(property: unknown): unknown {
  if (!isRecord(property)) return ''
  if ('const' in property) return property.const
  if (Array.isArray(property.enum) && property.enum.length) return property.enum[0]
  switch (property.type) {
    case 'number':
    case 'integer':
      return typeof property.minimum === 'number' ? property.minimum : 0
    case 'boolean':
      return false
    case 'array':
      return [exampleValue(property.items)]
    case 'object':
      return {}
    default:
      return ''
  }
}

/** JavaScript source, not JSON — this text is going into a console. */
function literal(value: unknown): string {
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (Array.isArray(value)) return `[${value.map(literal).join(', ')}]`
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'object') {
    const body = Object.entries(value as Record<string, unknown>)
      .map(([key, inner]) => `${key}: ${literal(inner)}`)
      .join(', ')
    return body ? `{ ${body} }` : '{}'
  }
  return String(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const CAPABILITY_HELP: Record<Capability, string> = {
  reads: 'Only looks at page state. Never changes anything.',
  writes: 'Adds to the page. Does not overwrite existing work.',
  overwrites: 'Can overwrite or remove something the human already has.',
}

/**
 * The prompts tab.
 *
 * A viewer who has never used a page-hosted tool surface does not learn what it
 * is from a list of function names, so the panel says out loud what to type.
 * Every line here is a request the current tool set can actually satisfy, and
 * the gloss after the dash names the effect the viewer will see on this page —
 * the point being that the agent moves *this* UI, not a copy of it.
 */
const PROMPTS: Array<{ ask: string; effect: string }> = [
  { ask: 'What am I looking at?', effect: 'reads the route and selection' },
  { ask: 'Show me trends breaking out this week', effect: 'filters and sorts the table' },
  { ask: 'Open the top one and summarise why it works', effect: 'writes into the trend page' },
  { ask: 'Draft a brief for it with our best-fit product', effect: 'fills the composer' },
  { ask: 'Put that brief on the calendar for Friday', effect: 'schedules it' },
]

function AskTab({ supported }: { supported: boolean }) {
  return (
    <>
      <ul style={S.list} data-testid="prompt-list">
        {PROMPTS.map((prompt) => (
          <li key={prompt.ask} style={S.promptItem}>
            <p style={S.promptAsk}>“{prompt.ask}”</p>
            <p style={S.promptEffect}>{prompt.effect}</p>
          </li>
        ))}
      </ul>
      <p style={S.empty}>
        {supported
          ? 'Type these to the agent while this page is open — it discovers the tools above on its own.'
          : 'This browser has no WebMCP, so an agent reaches the same tools through the console: window.__td.listTools(), then window.__td.callTool(name, input).'}
      </p>
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
          <li key={event.traceId} style={S.item} data-testid={`event-${event.traceId}`}>
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
const EMPTY_TOOLS: BridgeToolInfo[] = []

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
const SANS = 'Inter, system-ui, "Segoe UI", Roboto, sans-serif'

/** Enter is a touch slower than exit, which is the usual asymmetry for a sheet. */
const IN_MS = 260
const OUT_MS = 190
/* Decelerating, so the sheet settles rather than stopping dead. */
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

const S = {
  /**
   * The floating sheet. Always mounted; `open` drives transform and opacity so
   * the exit animates too.
   *
   * `visibility` is what actually removes it from hit-testing and from the
   * accessibility tree, and it must not flip until the exit has finished — so
   * its transition is delayed by the exit duration when closing and immediate
   * when opening. `pointerEvents` covers the interval in between.
   */
  sheet: (open: boolean, calm: boolean) => ({
    position: 'fixed' as const,
    right: 16,
    bottom: 62,
    width: 340,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'min(72vh, 640px)',
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'var(--panel-bg, #14181f)',
    color: 'var(--panel-fg, #e7ebf1)',
    border: '1px solid var(--panel-line, #2a323d)',
    borderRadius: 14,
    boxShadow: '0 18px 50px -18px rgba(11,28,48,0.34), 0 2px 8px rgba(11,28,48,0.06)',
    fontFamily: SANS,
    fontSize: 12,
    zIndex: 900,
    overflow: 'hidden',
    transformOrigin: 'bottom right',
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
    visibility: (open ? 'visible' : 'hidden') as 'visible' | 'hidden',
    pointerEvents: (open ? 'auto' : 'none') as 'auto' | 'none',
    transition: calm
      ? 'none'
      : [
          `opacity ${open ? IN_MS : OUT_MS}ms ${EASE}`,
          `transform ${open ? IN_MS : OUT_MS}ms ${EASE}`,
          `visibility 0s linear ${open ? 0 : OUT_MS}ms`,
        ].join(', '),
  }),
  /**
   * The pill, which is the whole component when the sheet is shut.
   *
   * It stays in place across the transition — the sheet grows out of its top
   * edge rather than the pill moving aside — so the corner does not jump.
   */
  statusPill: (open: boolean, calm: boolean) => ({
    position: 'fixed' as const,
    right: 16,
    bottom: 16,
    zIndex: 901,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '8px 13px',
    borderRadius: 999,
    border: '1px solid var(--panel-line, #2a323d)',
    background: 'var(--panel-bg, #14181f)',
    color: 'var(--panel-fg, #e7ebf1)',
    boxShadow: open
      ? '0 2px 8px rgba(11,28,48,0.08)'
      : '0 8px 24px -10px rgba(11,28,48,0.28), 0 1px 3px rgba(11,28,48,0.06)',
    fontFamily: SANS,
    fontSize: 10.5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    fontVariantNumeric: 'tabular-nums' as const,
    cursor: 'pointer',
    transition: calm ? 'none' : `box-shadow ${IN_MS}ms ${EASE}`,
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '11px 8px 11px 12px',
    boxSizing: 'border-box' as const,
    borderBottom: '1px solid var(--panel-line, #2a323d)',
  },
  close: {
    flexShrink: 0,
    width: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center' as const,
    borderRadius: 6,
    border: 0,
    background: 'transparent',
    color: 'inherit',
    fontFamily: SANS,
    fontSize: 12,
    lineHeight: 1,
    opacity: 0.55,
    cursor: 'pointer',
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
    background: ok ? 'var(--panel-accent, #35cdbc)' : 'var(--panel-warn, #f0a227)',
    flexShrink: 0,
  }),
  title: {
    flex: 1,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontSize: 10.5,
    fontWeight: 600,
  },
  chevron: (open: boolean) => ({
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 140ms ease',
    opacity: 0.5,
    display: 'inline-block',
  }),
  body: { overflowY: 'auto' as const, padding: 6 },
  empty: { margin: 0, padding: '10px 8px', opacity: 0.7, lineHeight: 1.55, fontSize: 11 },
  inlineCode: { fontFamily: MONO, color: 'var(--panel-warn, #f0a227)', background: 'transparent' },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  item: { borderRadius: 8, padding: '8px 8px 6px' },
  row: { display: 'flex', alignItems: 'center', gap: 7 },
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
  name: {
    fontFamily: MONO,
    fontSize: 12,
    background: 'transparent',
    flex: 1,
    minWidth: 0,
    fontWeight: 600,
  },
  ms: { fontSize: 10.5, opacity: 0.6, fontVariantNumeric: 'tabular-nums' as const },
  pill: (capability: Capability) => ({
    flexShrink: 0,
    padding: '2px 7px',
    borderRadius: 999,
    fontSize: 9.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
    color: CAPABILITY_STYLE[capability].color,
    background: CAPABILITY_STYLE[capability].bg,
  }),
  detail: { padding: '0 8px 8px', display: 'flex', flexDirection: 'column' as const, gap: 6 },
  desc: { margin: '5px 0 0', opacity: 0.8, lineHeight: 1.55, fontSize: 11 },
  note: {
    margin: '5px 0 0',
    lineHeight: 1.5,
    fontSize: 10.5,
    color: 'var(--panel-warn, #f0a227)',
    opacity: 0.9,
  },
  commandRow: { display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  command: {
    flex: 1,
    minWidth: 0,
    margin: 0,
    padding: 8,
    background: 'var(--panel-well, rgba(0,0,0,0.28))',
    borderRadius: 6,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    fontFamily: MONO,
    fontSize: 10.5,
    lineHeight: 1.5,
    userSelect: 'all' as const,
  },
  copy: {
    flexShrink: 0,
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid var(--panel-line, #2a323d)',
    background: 'transparent',
    color: 'inherit',
    fontFamily: SANS,
    fontSize: 9.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
  },
  commandNote: { margin: '5px 0 0', fontSize: 10, lineHeight: 1.45, opacity: 0.55 },
  commandBlocked: {
    margin: '6px 0 0',
    fontSize: 10.5,
    lineHeight: 1.5,
    opacity: 0.85,
    borderLeft: '2px solid var(--panel-accent, #6f8cff)',
    paddingLeft: 8,
  },
  schemaToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    padding: 0,
    background: 'transparent',
    border: 0,
    color: 'inherit',
    fontFamily: SANS,
    fontSize: 10,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    opacity: 0.55,
    cursor: 'pointer',
  },
  err: { margin: 0, color: 'var(--panel-danger, #f0817e)', lineHeight: 1.5, fontSize: 11 },
  promptItem: { padding: '8px', borderRadius: 8 },
  promptAsk: { margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--panel-fg, #e7ebf1)' },
  promptEffect: { margin: '2px 0 0', fontSize: 10.5, lineHeight: 1.45, opacity: 0.6 },
  schema: {
    margin: '6px 0 0',
    padding: 8,
    background: 'var(--panel-well, rgba(0,0,0,0.28))',
    borderRadius: 6,
    overflowX: 'auto' as const,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    fontFamily: MONO,
    fontSize: 10.5,
    lineHeight: 1.5,
  },
}
