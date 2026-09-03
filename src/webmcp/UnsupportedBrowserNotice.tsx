import { useWebMCPSupport } from './useTool'

/**
 * Shown when the page loads in a browser that cannot see the tool surface.
 *
 * This exists because of how judging works: a judge opens the live URL, and if
 * WebMCP is off they see a static page with no explanation and score it as
 * broken. Never let that happen silently — say exactly which two environments
 * work and how to get into them.
 */
export function UnsupportedBrowserNotice() {
  const { supported, checked } = useWebMCPSupport()
  if (!checked || supported) return null

  return (
    <div role="status" style={S.bar}>
      <div style={S.inner}>
        <p style={S.lead}>
          <strong style={S.strong}>This page hands its tools to an AI agent</strong> — and this
          browser cannot see them yet. The app still works by hand; the agent side needs one of:
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
        </ol>
      </div>
    </div>
  )
}

const S = {
  bar: {
    background: '#33260f',
    color: '#f6d9a8',
    borderBottom: '1px solid #5a4418',
    fontSize: 13.5,
    lineHeight: 1.55,
  },
  inner: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  lead: { margin: 0 },
  strong: { color: '#ffce6a', fontWeight: 600 },
  list: { margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 5 },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    background: 'rgba(0,0,0,0.35)',
    padding: '1px 5px',
    borderRadius: 3,
    fontSize: 12.5,
  },
}
