import React from 'react'

// Recursive Preview component: renders read-only hierarchical view of questions
export default function Preview({ items, numbering = '' }) {
  if (!items || items.length === 0) return null

  return (
    <div className="preview-list">
      {items.map((item, idx) => {
        const num = numbering ? `${numbering}.${idx + 1}` : `${idx + 1}`
        return (
          <div key={item.id} className="preview-node">
            <div className="preview-header">{num}</div>
            <div className="preview-body">
              <div><strong>Text:</strong> {item.text || <em>(empty)</em>}</div>
              <div><strong>Type:</strong> {item.type}</div>
              {item.answer && <div><strong>Answer:</strong> {item.answer}</div>}
            </div>
            {item.children && item.children.length > 0 && (
              <Preview items={item.children} numbering={num} />
            )}
          </div>
        )
      })}
    </div>
  )
}
