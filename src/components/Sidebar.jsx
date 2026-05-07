import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'

// Build a nested outline with depth and index strings
function buildIndex(items, prefix = '', ancestors = []) {
  const out = []
  items.forEach((it, i) => {
    const idx = prefix ? `${prefix}.${i + 1}` : `${i + 1}`
    const depth = idx.split('.').length - 1
    out.push({ id: it.id, label: it.text || 'Untitled', depth, index: idx, hasChildren: !!(it.children && it.children.length), ancestors: [...ancestors] })
    if (it.children && it.children.length) {
      out.push(...buildIndex(it.children, idx, [...ancestors, it.id]))
    }
  })
  return out
}

export default function Sidebar({ items = [], onSelect = () => {}, activeId = null }) {
  const list = useMemo(() => buildIndex(items), [items])
  const [collapsed, setCollapsed] = useState({})
  const [flashId, setFlashId] = useState(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [])

  const toggle = useCallback((id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const handleClick = useCallback((node) => {
    // Ensure any collapsed ancestors are expanded so the user sees the path in the sidebar
    if (node.ancestors && node.ancestors.length) {
      setCollapsed(prev => {
        const next = { ...prev }
        node.ancestors.forEach(a => { next[a] = false })
        return next
      })
    }

    // brief flash highlight in sidebar
    setFlashId(node.id)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashId(null), 900)

    // scroll to element via callback (App will do scrollIntoView)
    onSelect(node.id)
  }, [onSelect])

  // When rendering we skip items whose any ancestor is collapsed
  return (
    <nav className="doc-sidebar" aria-label="Document outline">
      <div className="sidebar-inner">
        <div className="sidebar-spacer" aria-hidden />
        <div className="sidebar-header">QUESTIONS INDEXING</div>
        {list.map(node => {
          // if any ancestor is collapsed, hide this node
          const hidden = node.ancestors && node.ancestors.some(a => collapsed[a])
          if (hidden) return null

          const indent = 12 + node.depth * 14
          const isActive = activeId === node.id
          const isFlashed = flashId === node.id
          return (
            <div key={node.id} className={`sidebar-row ${isActive ? 'active' : ''} ${isFlashed ? 'flash' : ''}`} style={{ paddingLeft: indent }}>
              <button className="sidebar-item" onClick={() => handleClick(node)} title={node.label}>
                <span className="sidebar-index">{node.index}</span>
                <span className="sidebar-title" aria-current={isActive ? 'true' : undefined}>{node.label}</span>
              </button>
              {node.hasChildren && (
                <button className={`sidebar-collapse ${collapsed[node.id] ? 'collapsed' : ''}`} onClick={() => toggle(node.id)} aria-label="Toggle section">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
