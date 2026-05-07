import React from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableQuestion from './SortableQuestion'

// Recursive component: renders a question and its children (if any)
export default function QuestionItem({ question, updateQuestion, addChildQuestion, numbering, deleteQuestion, mode = 'developer', depth = 0 }) {
  const MAX_VISIBLE_DEPTH = 3 // after this we collapse/compact children
  const [collapsed, setCollapsed] = React.useState(depth >= MAX_VISIBLE_DEPTH)

  const handleTextChange = (e) => updateQuestion?.(question.id, { text: e.target.value })

  const handleTypeChange = (e) => {
    const newType = e.target.value
    const changes = { type: newType }
    if (newType === 'truefalse' && (question.answer === undefined || question.answer === '')) {
      changes.answer = 'true'
    }
    if (newType !== 'truefalse') changes.answer = ''
    updateQuestion?.(question.id, changes)
  }

  const handleAnswerChange = (e) => updateQuestion?.(question.id, { answer: e.target.value })

  const canAddChild = question.type === 'truefalse' && question.answer === 'true'

  // In user mode: provide proper input types for answering
  const renderUserAnswerControl = () => {
    if (question.type === 'short' || question.type === 'text') {
      return (
        <input
          type="text"
          className="user-answer"
          value={question.answer || ''}
          onChange={(e) => updateQuestion?.(question.id, { answer: e.target.value })}
          placeholder="Type your answer"
        />
      )
    }
    if (question.type === 'truefalse') {
      return (
        <select className="user-answer" value={question.answer || 'true'} onChange={(e) => updateQuestion?.(question.id, { answer: e.target.value })}>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )
    }
    return null
  }

  return (
    <div className={`question-node ${depth === 0 ? 'parent' : 'child'} depth-${Math.min(depth, 6)}`}>
      <div className="question-item">
        <div className="question-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <div className="qid" aria-hidden={mode === 'user'}>{numbering}</div>
            {/* Show title prominently in user mode, otherwise allow editing */}
            {mode === 'user' ? (
              <div className="question-title">{question.text || <em>Untitled question</em>}</div>
            ) : (
              <div className="editable-title">
                <label className="visually-hidden">Question Text</label>
                <input type="text" value={question.text} onChange={handleTextChange} placeholder="Enter question text" />
              </div>
            )}
          </div>

          <div className="depth-actions" style={{display:'flex',gap:8,alignItems:'center'}}>
            {question.children && question.children.length > 0 && (
              <button
                className={`btn-toggle chevron ${collapsed ? '' : 'expanded'}`}
                onClick={() => setCollapsed(c => !c)}
                aria-expanded={!collapsed}
                title={collapsed ? `Expand ${question.children.length} children` : 'Collapse children'}
              >
                <svg className="chev-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only">{collapsed ? `Expand ${question.children.length} children` : 'Collapse children'}</span>
              </button>
            )}
            {mode === 'developer' && (
              <div className="dev-hint" style={{color:'var(--muted-2)',fontSize:12}}>{question.type === 'short' ? 'Short Answer' : (question.type === 'truefalse' ? 'True / False' : question.type)}</div>
            )}
          </div>
        </div>

        <div className="qcontrols">
          <div className="qrow">
            {mode !== 'user' && (
              <div className="field">
                <label>
                  Type
                  <select value={question.type} onChange={handleTypeChange}>
                    <option value="text">Text</option>
                    <option value="short">Short Answer</option>
                    <option value="truefalse">True / False</option>
                  </select>
                </label>
              </div>
            )}

            {/* Developer-only answer control for conditioning children */}
            {mode === 'developer' && question.type === 'truefalse' && (
              <div className="field">
                <label>
                  Answer
                  <select value={question.answer || 'true'} onChange={handleAnswerChange}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </label>
              </div>
            )}

            {/* User-facing answer controls */}
            {mode === 'user' && (
              <div className="field user-control">
                {renderUserAnswerControl()}
              </div>
            )}
          </div>

          <div className="actions-row">
            {mode === 'developer' && canAddChild && (
              <button className="btn-add-child" onClick={() => addChildQuestion?.(question.id)}>Add Child Question</button>
            )}

            {mode === 'developer' && (
              <button className="btn-delete" onClick={() => {
                if (typeof deleteQuestion === 'function') {
                  if (confirm('Delete this question and all its children?')) {
                    deleteQuestion(question.id)
                  }
                }
              }}>Delete</button>
            )}
          </div>
        </div>
      </div>

      {question.children && question.children.length > 0 && !collapsed && (
        <div className="children-list">
          <SortableContext items={question.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {question.children.map((child, idx) => (
              <SortableQuestion
                key={child.id}
                id={child.id}
                question={child}
                index={idx}
                updateQuestion={updateQuestion}
                addChildQuestion={addChildQuestion}
                numbering={`${numbering}.${idx + 1}`}
                deleteQuestion={deleteQuestion}
                mode={mode}
                depth={depth + 1}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}
