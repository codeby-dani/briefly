/**
 * Trace IDs and the tool event log. See plan/04-observability.md.
 *
 * When an agent calls a tool and nothing visible happens there are four
 * possibilities and no way to tell them apart from outside: the tool was never
 * on the surface, the input was bad, the executor threw, or it succeeded and the
 * UI failed to re-render. On a three-minute demo timer, guessing is not viable.
 *
 * So every executor goes through `traced()`. It is applied centrally when tools
 * are built, never by the executor itself — an executor that has to remember to
 * log will forget, and it will forget in the one that matters.
 */

import type { ToolSpec } from '../webmcp'

export const EVENTS_KEY = 'td:events'
const RING = 200
const TRUNCATE = 500

export interface ToolEventNetwork {
  endpoint: string
  status: number
  source: 'model' | 'cached'
}

export interface ToolEvent {
  traceId: string
  tool: string
  at: string
  durationMs: number
  ok: boolean
  input: unknown
  output: unknown
  error?: string
  network?: ToolEventNetwork
}

export function newTraceId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function truncate(value: unknown): unknown {
  try {
    const text = JSON.stringify(value)
    if (text === undefined) return String(value)
    return text.length > TRUNCATE ? `${text.slice(0, TRUNCATE)}…` : JSON.parse(text)
  } catch {
    return '[unserialisable]'
  }
}

type Listener = () => void
const listeners = new Set<Listener>()
const EMPTY_EVENTS: ToolEvent[] = []
let cachedRaw: string | null | undefined
let cachedEvents: ToolEvent[] = EMPTY_EVENTS

export function subscribeToEvents(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function readEvents(): ToolEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (raw === cachedRaw) return cachedEvents
    cachedRaw = raw
    if (!raw) return (cachedEvents = EMPTY_EVENTS)
    const parsed: unknown = JSON.parse(raw)
    return (cachedEvents = Array.isArray(parsed) ? (parsed as ToolEvent[]) : EMPTY_EVENTS)
  } catch {
    return EMPTY_EVENTS
  }
}

export function recordEvent(event: ToolEvent): void {
  try {
    const next = [event, ...readEvents()].slice(0, RING)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next))
  } catch {
    // A full or unavailable localStorage must never take a tool call down with
    // it. The console line below is still written.
  }
  listeners.forEach((fn) => fn())
}

/**
 * The output shape every traced tool returns.
 *
 * `_trace` is deliberately handed back to the agent: an agent that reports "the
 * call returned t_m1x9_4k2p but nothing changed" has given you the thread to
 * pull.
 */
export type Traced<T> = T & { _trace: string }

/** Anything a network-touching executor wants recorded on its event. */
export interface TraceContext {
  network?: ToolEventNetwork
}

/**
 * What an executor actually receives. `trace` is the channel back into the
 * event log for the one tool that leaves the page.
 */
export interface ToolContext {
  signal: AbortSignal
  trace?: TraceContext
}

/**
 * Wrap one tool spec so every execution is timed, logged and traced.
 *
 * The executor may take a second argument to attach network detail — only
 * `analyze_trend` needs it, and it is the only tool that can fail for reasons
 * the rest of the log cannot explain.
 */
export function traced(spec: ToolSpec): ToolSpec {
  return {
    ...spec,
    execute: async (input: unknown, context: { signal: AbortSignal }) => {
      const traceId = newTraceId()
      const started = performance.now()
      const trace: TraceContext = {}

      const execContext: ToolContext = { ...context, trace }

      try {
        const result = await spec.execute(input, execContext)
        const durationMs = Math.round(performance.now() - started)
        const ok = !(result && typeof result === 'object' && 'ok' in result && result.ok === false)

        console.log(
          `[webmcp] ${traceId}  ${spec.name}  ${ok ? 'ok' : 'FAIL'}  ${durationMs}ms`,
          ok ? '' : truncate(input),
        )
        recordEvent({
          traceId,
          tool: spec.name,
          at: new Date().toISOString(),
          durationMs,
          ok,
          input: truncate(input),
          output: truncate(result),
          ...(trace.network ? { network: trace.network } : {}),
        })

        if (result && typeof result === 'object') {
          return { ...(result as object), _trace: traceId }
        }
        return { value: result, _trace: traceId }
      } catch (error) {
        const durationMs = Math.round(performance.now() - started)
        const message = error instanceof Error ? error.message : String(error)

        console.log(`[webmcp] ${traceId}  ${spec.name}  FAIL  ${message}`, truncate(input))
        recordEvent({
          traceId,
          tool: spec.name,
          at: new Date().toISOString(),
          durationMs,
          ok: false,
          input: truncate(input),
          output: null,
          error: message,
          ...(trace.network ? { network: trace.network } : {}),
        })

        // Returned, not rethrown. An executor that is honest in failure teaches
        // the agent to correct itself; an opaque throw does not.
        return { ok: false, reason: message, _trace: traceId }
      }
    },
  }
}
