import { useEffect, useRef, useState } from 'react'
import { parseSchema } from './types'
import { useSurfaceSource, useToolSurface } from './useTool'

const GHOST_MS = 1100
const FLASH_MS = 1100

/**
 * Live view of the tool surface exactly as an agent sees it.
 *
 * This is a debugging aid and a demo device at the same time. Tools flash in
 * when they register and linger struck-through when they unregister, so a
 * viewer can watch the surface follow the human's selection instead of taking
 * our word for it.
 */
export function ToolSurfacePanel({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const tools = useToolSurface()
  const source = useSurfaceSource()
  const supported = source === 'webmcp'
  const [open, setOpen] = useState(defaultOpen)
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
        <div style={S.body}>
          {!supported && (
            <p style={S.empty}>
              WebMCP is off in this browser, so these tools are served through the
              bridge instead: <code style={S.inlineCode}>window.__td</code>. Any agent
              that can run JavaScript here — Claude included — can call them.
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
        </div>
      )}
    </aside>
  )
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
    borderRadius: 8,
    boxShadow: '0 12px 40px -16px rgba(0,0,0,0.6)',
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
  dot: (ok: boolean) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: ok ? '#35cdbc' : '#f0817e',
    flexShrink: 0,
  }),
  title: { flex: 1, letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontSize: 10.5 },
  count: { color: '#f0a227', fontWeight: 600, fontVariantNumeric: 'tabular-nums' as const },
  chevron: (open: boolean) => ({
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 140ms ease',
    opacity: 0.5,
    display: 'inline-block',
  }),
  body: { overflowY: 'auto' as const, padding: 6 },
  empty: { margin: 0, padding: '10px 8px', opacity: 0.55, lineHeight: 1.5 },
  inlineCode: { fontFamily: MONO, color: '#f0a227' },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' as const, gap: 2 },
  item: (isNew: boolean) => ({
    borderRadius: 5,
    background: isNew ? 'rgba(53,205,188,0.16)' : 'transparent',
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
  name: { fontFamily: MONO, fontSize: 12 },
  badge: { fontSize: 9, letterSpacing: '0.08em', color: '#35cdbc', textTransform: 'uppercase' as const },
  badgeGone: { fontSize: 9, letterSpacing: '0.08em', color: '#f0817e', textTransform: 'uppercase' as const },
  ghost: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 8px',
    opacity: 0.4,
    textDecoration: 'line-through',
  },
  detail: { padding: '0 8px 8px', display: 'flex', flexDirection: 'column' as const, gap: 6 },
  desc: { margin: 0, opacity: 0.7, lineHeight: 1.5, fontSize: 11 },
  schema: {
    margin: 0,
    padding: 8,
    background: 'rgba(0,0,0,0.28)',
    borderRadius: 4,
    overflowX: 'auto' as const,
    fontSize: 10.5,
    lineHeight: 1.5,
  },
}
