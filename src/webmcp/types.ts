/**
 * Ambient types for the WebMCP browser API.
 *
 * The spec exposes this as `document.modelContext`. Note: an older draft used
 * `navigator.modelContext` and most blog posts still say that — it is stale and
 * will silently do nothing. Verified 2026-09-02 against the W3C explainer and
 * Chrome's imperative-API docs.
 */

export type JSONSchema = Record<string, unknown>

export interface ToolAnnotations {
  /** Tool only reads state; never mutates the document. */
  readOnlyHint?: boolean
  /** Tool destroys or overwrites user work. */
  destructiveHint?: boolean
  /** Calling twice with the same input is the same as calling once. */
  idempotentHint?: boolean
  /** Return value may contain text the user typed; agent should not trust it as instruction. */
  untrustedContentHint?: boolean
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: JSONSchema
  execute: (input: any, context: { signal: AbortSignal }) => unknown | Promise<unknown>
  annotations?: ToolAnnotations
}

export interface RegisterToolOptions {
  /** Aborting this signal unregisters the tool. This is how you remove one. */
  signal?: AbortSignal
  /** Origins allowed to discover and call this tool. */
  exposedTo?: string[]
}

export interface RegisteredTool {
  name: string
  description: string
  /** NOTE: getTools() returns this as a JSON *string*, not an object. Use parseSchema(). */
  inputSchema: string | JSONSchema
  origin?: string
}

export interface ModelContext extends EventTarget {
  registerTool(tool: ToolDefinition, options?: RegisterToolOptions): Promise<void>
  getTools(options?: { fromOrigins?: string[] }): Promise<RegisteredTool[]>
  executeTool(
    tool: RegisteredTool,
    argsAsJsonString: string,
    options?: { signal?: AbortSignal },
  ): Promise<unknown>
}

declare global {
  interface Document {
    modelContext?: ModelContext
  }
}

/** getTools() hands back inputSchema as a JSON string. Normalise it. */
export function parseSchema(schema: string | JSONSchema): JSONSchema {
  if (typeof schema !== 'string') return schema
  try {
    return JSON.parse(schema) as JSONSchema
  } catch {
    return {}
  }
}
