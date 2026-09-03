import { useWebMCPSupport } from './useTool'

/**
 * Shown when the page loads in a browser that cannot see the native tool
 * surface.
 *
 * This exists because of how judging works: a judge opens the live URL, and if
 * WebMCP is off they see a static page with no explanation and score it as
 * broken. Never let that happen silently — say exactly which environments work
 * and how to get into them.
 *
 * Three of them, not two. `document.modelContext` is a Chrome 149+ feature and
 * ships enabled only in ChatGPT's in-app browser, which would leave every other
 * agent — Claude included — with no way in. So the same tools are also reachable
 * at `window.__td` for any agent that can run JavaScript on the page. Same
 * executors, same page state. See bridge.ts.
 */
export function UnsupportedBrowserNotice() {
  const { supported, checked } = useWebMCPSupport()
  if (!checked || supported) return null

  return (
    <div role="status" style={S.bar} data-testid="unsupported-notice">
      <div style={S.inner}>
        <p style={S.lead}>
          <strong style={S.strong}>This page hands its tools to an AI agent</strong> — and this
          browser cannot see the native surface. The app still works by hand; the agent side
          needs one of:
        </p>
        <ol style={S.list}>
          <li>
            <strong style={S.strong}>ChatGPT desktop app</strong> — open this URL in its built-in
            browser. WebMCP is on by default, nothing to configure.
          </li>
          <li>
            <strong style={S.strong}>Chrome 149 or newer</strong> — visit{' '}
            <code style={S.code}>chrome://flags/#enable-webmcp-testing</code>, set it to{' '}
            <em>Enabled</em>, restart Chrome, then reload this page.
          </li>
          <li>
            <strong style={S.strong}>Claude, or any agent that can run JavaScript here</strong> —
            no flag needed. The same tools are on <code style={S.code}>window.__td</code>:{' '}
            <code style={S.code}>__td.listTools()</code> to see them,{' '}
            <code style={S.code}>await __td.callTool(name, input)</code> to run one.
          </li>
        </ol>
      </div>
    </div>
  )
}

const S = {
  bar: {
    // Retoned in Phase 6 for the light Stitch palette. Reads through tokens so
    // the notice tracks index.css rather than pinning its own amber.
    background: 'var(--warn-bg, #ffeacc)',
    color: 'var(--warn, #8a4b00)',
    borderBottom: '1px solid var(--warn-border, #edbd7a)',
    fontSize: 13,
    lineHeight: 1.55,
  },
  inner: {
    maxWidth: 900,
    padding: '14px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  lead: { margin: 0 },
  strong: { color: 'var(--warn, #8a4b00)', fontWeight: 700 },
  list: { margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 5 },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    background: 'rgba(138, 75, 0, 0.12)',
    color: 'inherit',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 12,
  },
}
