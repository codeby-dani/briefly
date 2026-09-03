/**
 * The tracing wrapper every tool executor goes through.
 *
 * There is no server, so this is the whole of the app's observability. See
 * 04-observability.md for why: when an agent calls a tool and nothing visible
 * happens, there are four possible causes and no way to tell them apart from
 * outside the page. A trace id that appears in the console, in the event log
 * and in the payload the agent received collapses that guesswork into one
 * string comparison.
 *
 * The wrapper is applied centrally, in `traced()`, rather than by each
 * executor. An executor that has to remember to log will eventually forget,
 * and it will forget in the one that matters.
 */

import { useEffect, useRef } from 'react'
import type { ToolSpec } from '../webmcp'
import { useToolSurface } from '../webmcp'

const EVENTS_KEY = 'td:events'
const RING_SIZE = 200
const FIELD_LIMIT = 500

export interface ToolEventNetwork {
  endpoint: '/api/analyze'
  status: number
  source: 'model' | 'cached'
}

export interface ToolEvent {
  traceId: string
  tool: string
  /** ISO timestamp. */
  at: string
  durationMs: number
  ok: boolean
  input: unknown
  output: unknown
  error?: string
  /** Present only on `analyze_trend`, the one tool that leaves the page. */
  network?: ToolEventNetwork
}

export function newTraceId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

/** Truncate anything headed for the ring buffer; a transcript would swamp it. */
function clip(value: unknown): unknown {
  let text: string
  try {
    text = JSON.stringify(value) ?? String(value)
  } catch {
    return '[unserialisable]'
  }
  return text.length > FIELD_LIMIT ? `${text.slice(0, FIELD_LIMIT)}…` : text
}

export function readEvents(): ToolEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as ToolEvent[]) : []
  } catch {
    return []
  }
}

function appendEvent(event: ToolEvent): void {
  try {
    const next = [...readEvents(), event].slice(-RING_SIZE)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next))
  } catch {
    // A full or unavailable localStorage must never break a tool call.
  }
  window.dispatchEvent(new CustomEvent('td:toolevent', { detail: event }))
}

/**
 * Network detail for the event log, attached by an executor that made a call.
 *
 * `analyze_trend` is the only tool that can fail for reasons the rest of the
 * log cannot explain — a 404 from a misrouted function, a 503 from a missing
 * key, a 429 from an exhausted free tier. Recording status and source turns
 * all three into one glance.
 */
export interface TraceContext {
  traceId: string
  signal: AbortSignal
  setNetwork: (network: ToolEventNetwork) => void
}

export type TracedExecute = (input: any, context: TraceContext) => unknown | Promise<unknown>

/**
 * Wrap one tool spec so its executor logs, times and stamps every call.
 *
 * The returned payload carries `_trace`, deliberately: an agent that reports
 * "the call returned t_m1x9_4k2p but nothing changed" has handed over the
 * thread to pull.
 */
export function traced(spec: Omit<ToolSpec, 'execute'> & { execute: TracedExecute }): ToolSpec {
  return {
    ...spec,
    execute: async (input, context) => {
      const traceId = newTraceId()
      const startedAt = performance.now()
      let network: ToolEventNetwork | undefined

      try {
        const result = await spec.execute(input, {
          traceId,
          signal: context.signal,
          setNetwork: (n) => {
            network = n
          },
        })
        const durationMs = Math.round(performance.now() - startedAt)

        // Successes do not print their input — the console stays readable
        // while a demo is being recorded.
        console.info(`[webmcp] ${traceId}  ${spec.name}  ok  ${durationMs}ms`)
        appendEvent({
          traceId,
          tool: spec.name,
          at: new Date().toISOString(),
          durationMs,
          ok: true,
          input: clip(input),
          output: clip(result),
          ...(network ? { network } : {}),
        })

        return result && typeof result === 'object'
          ? { ...(result as Record<string, unknown>), _trace: traceId }
          : { value: result, _trace: traceId }
      } catch (err: unknown) {
        const durationMs = Math.round(performance.now() - startedAt)
        const message = err instanceof Error ? err.message : String(err)

        console.error(`[webmcp] ${traceId}  ${spec.name}  FAIL  ${message}`, input)
        appendEvent({
          traceId,
          tool: spec.name,
          at: new Date().toISOString(),
          durationMs,
          ok: false,
          input: clip(input),
          output: null,
          error: message,
          ...(network ? { network } : {}),
        })

        throw err
      }
    },
  }
}

/**
 * Log registrations and unregistrations with the resulting surface count.
 *
 * "The agent says it cannot see the tool" is the other half of the failure
 * space, and the count in the line is the cheapest possible check that the
 * tool-surface state machine in 02-data-model.md is behaving.
 */
export function useSurfaceLogging(): void {
  const tools = useToolSurface()
  const prev = useRef<string[]>([])

  useEffect(() => {
    const names = tools.map((t) => t.name)
    const before = prev.current
    prev.current = names

    for (const name of names.filter((n) => !before.includes(n))) {
      console.info(`[webmcp] + ${name}  (surface: ${names.length})`)
    }
    for (const name of before.filter((n) => !names.includes(n))) {
      console.info(`[webmcp] - ${name}  (surface: ${names.length})`)
    }
  }, [tools])
}
