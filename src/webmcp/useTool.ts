import { useEffect, useRef, useState } from 'react'
import type { JSONSchema, RegisteredTool, ToolAnnotations } from './types'

export interface ToolSpec {
  name: string
  description: string
  inputSchema: JSONSchema
  execute: (input: any, context: { signal: AbortSignal }) => unknown | Promise<unknown>
  annotations?: ToolAnnotations
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
    const mc = document.modelContext
    if (!mc) return

    const current = staticPart.current
    if (!current) return

    const controller = new AbortController()

    mc.registerTool(
      {
        name: current.name,
        description: current.description,
        inputSchema: current.inputSchema,
        annotations: current.annotations,
        execute: (input, context) => {
          const fn = executeRef.current
          if (!fn) throw new Error(`Tool "${current.name}" is no longer mounted.`)
          return fn(input, context)
        },
      },
      { signal: controller.signal },
    ).catch((err: unknown) => {
      if (controller.signal.aborted) return
      console.error(`[webmcp] registerTool("${current.name}") failed:`, err)
    })

    // Aborting is how the spec says to unregister.
    return () => controller.abort()
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
    const mc = document.modelContext
    if (!mc) return
    const controller = new AbortController()

    ref.current.forEach((spec, i) => {
      if (!spec) return
      mc.registerTool(
        {
          name: spec.name,
          description: spec.description,
          inputSchema: spec.inputSchema,
          annotations: spec.annotations,
          execute: (input, context) => {
            const live = ref.current[i]
            if (!live) throw new Error(`Tool "${spec.name}" is no longer available.`)
            return live.execute(input, context)
          },
        },
        { signal: controller.signal },
      ).catch((err: unknown) => {
        if (controller.signal.aborted) return
        console.error(`[webmcp] registerTool("${spec.name}") failed:`, err)
      })
    })

    return () => controller.abort()
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
    if (!mc) return
    let alive = true

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
