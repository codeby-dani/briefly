import { useEffect, useRef, useState } from 'react'
import { bridgeTools, registerBridgeTool, subscribeToBridge } from './bridge'
import type { JSONSchema, RegisteredTool, ToolAnnotations } from './types'

export interface ToolSpec {
  name: string
  description: string
  inputSchema: JSONSchema
  execute: (input: any, context: { signal: AbortSignal }) => unknown | Promise<unknown>
  annotations?: ToolAnnotations
}

/**
 * Registration logging, per plan/04-observability.md.
 *
 * "The agent says it cannot see the tool" is half the failure space, and the
 * surface count in the line is the cheapest check that the state machine in
 * 02-data-model.md is behaving.
 */
function logRegistration(sign: '+' | '-', name: string) {
  const surface = bridgeTools().length
  console.log(`[webmcp] ${sign} ${name}  (surface: ${surface})`)
}

/** True once we know whether this browser speaks WebMCP. */
export function useWebMCPSupport(): { supported: boolean; checked: boolean } {
  const [state, setState] = useState({ supported: false, checked: false })
  useEffect(() => {
    setState({ supported: typeof document.modelContext?.registerTool === 'function', checked: true })
  }, [])
  return state
}

/**
 * Register one WebMCP tool for as long as this component wants it to exist.
 *
 * Pass `null` to unregister — that is the whole point. The tool surface is
 * meant to follow app state, not sit frozen from page load:
 *
 *   useTool(selectedId ? { name: 'set_text', ... } : null)
 *
 * The schema is allowed to change while the tool stays mounted. When it does,
 * the tool is torn down and re-registered so an agent never sees a schema that
 * disagrees with what the human is looking at.
 *
 * `execute` is read through a ref, so it always sees current state and does not
 * itself cause re-registration.
 */
export function useTool(spec: ToolSpec | null | false | undefined): void {
  const executeRef = useRef(spec ? spec.execute : undefined)
  executeRef.current = spec ? spec.execute : undefined

  // Re-register only when the agent-visible surface actually changes.
  const identity = spec
    ? JSON.stringify([spec.name, spec.description, spec.inputSchema, spec.annotations ?? null])
    : null

  const staticPart = useRef(spec)
  staticPart.current = spec

  useEffect(() => {
    if (!identity) return

    const current = staticPart.current
    if (!current) return

    const controller = new AbortController()
    const execute = (input: any, context: { signal: AbortSignal }) => {
      const fn = executeRef.current
      if (!fn) throw new Error(`Tool "${current.name}" is no longer mounted.`)
      return fn(input, context)
    }

    // The bridge always gets the tool, so an agent without WebMCP still has a
    // way in. See bridge.ts — one definition, two doors.
    const unregisterBridge = registerBridgeTool({
      name: current.name,
      description: current.description,
      inputSchema: current.inputSchema,
      annotations: current.annotations,
      execute,
    })
    logRegistration('+', current.name)

    document.modelContext
      ?.registerTool(
        {
          name: current.name,
          description: current.description,
          inputSchema: current.inputSchema,
          annotations: current.annotations,
          execute,
        },
        { signal: controller.signal },
      )
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        console.error(`[webmcp] registerTool("${current.name}") failed:`, err)
      })

    return () => {
      // Aborting is how the spec says to unregister.
      controller.abort()
      unregisterBridge()
      logRegistration('-', current.name)
    }
  }, [identity])
}

/** Register a whole set at once. Length and order may change freely between renders. */
export function useTools(specs: Array<ToolSpec | null | false | undefined>): void {
  const identity = JSON.stringify(
    specs.map((s) => (s ? [s.name, s.description, s.inputSchema, s.annotations ?? null] : null)),
  )
  const ref = useRef(specs)
  ref.current = specs

  useEffect(() => {
    const controller = new AbortController()
    const cleanups: Array<() => void> = []

    ref.current.forEach((spec, i) => {
      if (!spec) return
      const execute = (input: any, context: { signal: AbortSignal }) => {
        const live = ref.current[i]
        if (!live) throw new Error(`Tool "${spec.name}" is no longer available.`)
        return live.execute(input, context)
      }

      cleanups.push(
        registerBridgeTool({
          name: spec.name,
          description: spec.description,
          inputSchema: spec.inputSchema,
          annotations: spec.annotations,
          execute,
        }),
      )
      logRegistration('+', spec.name)

      document.modelContext
        ?.registerTool(
          {
            name: spec.name,
            description: spec.description,
            inputSchema: spec.inputSchema,
            annotations: spec.annotations,
            execute,
          },
          { signal: controller.signal },
        )
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          console.error(`[webmcp] registerTool("${spec.name}") failed:`, err)
        })
    })

    return () => {
      controller.abort()
      cleanups.forEach((fn) => fn())
      ref.current.forEach((spec) => spec && logRegistration('-', spec.name))
    }
  }, [identity])
}

/**
 * The live tool surface, as an agent would see it.
 *
 * Backed by the spec's `toolchange` event, so it updates the instant a tool is
 * registered or unregistered anywhere in the app. This is what the on-screen
 * inspector renders — and it is the thing that makes our differentiator visible
 * on camera.
 */
export function useToolSurface(): RegisteredTool[] {
  const [tools, setTools] = useState<RegisteredTool[]>([])

  useEffect(() => {
    const mc = document.modelContext
    let alive = true

    // No WebMCP: render the bridge registry instead of an empty panel. The
    // surface is the same either way, and a judge in ordinary Chrome should be
    // able to see what an agent would be offered.
    if (!mc) {
      const refresh = () => {
        if (alive) setTools(bridgeTools())
      }
      refresh()
      const unsubscribe = subscribeToBridge(refresh)
      return () => {
        alive = false
        unsubscribe()
      }
    }

    const refresh = () => {
      mc.getTools()
        .then((next) => { if (alive) setTools(next) })
        .catch(() => { /* surface is simply unavailable */ })
    }

    refresh()
    mc.addEventListener('toolchange', refresh)
    return () => {
      alive = false
      mc.removeEventListener('toolchange', refresh)
    }
  }, [])

  return tools
}

export type SurfaceSource = 'webmcp' | 'bridge'

/**
 * Which door the panel is currently rendering.
 *
 * `webmcp` means `document.modelContext` answered. `bridge` means it did not,
 * and the tools shown are the ones reachable at `window.__td` — real tools an
 * agent that can run JavaScript can still call, not a placeholder.
 */
export function useSurfaceSource(): SurfaceSource {
  const { supported } = useWebMCPSupport()
  return supported ? 'webmcp' : 'bridge'
}
