import React, { useState, useCallback, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import QuestionForm from './components/QuestionForm'
import SortableQuestion from './components/SortableQuestion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { arrayMove, findItemPath, moveItemAcrossParents } from './utils/reorder'
import Sidebar from './components/Sidebar'
import ReviewList from './components/ReviewList'
export default function App() {
  const [questions, setQuestions] = useState([])
  const [previewData, setPreviewData] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)
  const [mode, setMode] = useState('developer') // 'developer' or 'user'
  const [activeId, setActiveId] = useState(null)
  const [flipping, setFlipping] = useState(false)

  // Handle mode change with flip animation
  const handleModeChange = useCallback((checked) => {
    setFlipping(true)
    setTimeout(() => {
      setMode(checked ? 'user' : 'developer')
      setTimeout(() => setFlipping(false), 50)
    }, 350)
  }, [])

  // Load saved questions from localStorage on startup
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nested_form_questions')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setQuestions(parsed)
        }
      }
    } catch (e) {
      // If parsing fails, ignore and start with empty state
      console.warn('Failed to load saved questions:', e)
    }
  }, [])

  // Save questions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('nested_form_questions', JSON.stringify(questions))
    } catch (e) {
      console.warn('Failed to save questions:', e)
    }
  }, [questions])

  const addQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      text: '',
      type: 'text',
      answer: '',
      children: []
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  // updateQuestion updates any top-level field(s) of a question while preserving children
  const updateQuestion = useCallback((id, changes) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...changes } : q))
  }, [])

  // Helper to find and update a question by id recursively
  // Will also prune children when a truefalse answer changes from 'true' -> 'false'
  const updateQuestionRecursive = useCallback((items, id, changes) => {
    return items.map(item => {
      if (item.id === id) {
        // compute new values to decide whether to prune children
        const newType = changes.type !== undefined ? changes.type : item.type
        const newAnswer = changes.answer !== undefined ? changes.answer : item.answer
        const prevAnswer = item.answer
        const shouldPruneChildren = item.type === 'truefalse' && prevAnswer === 'true' && newAnswer === 'false'
        const updated = { ...item, ...changes }
        if (shouldPruneChildren) {
          // remove all children recursively
          updated.children = []
        }
        return updated
      }
      if (item.children && item.children.length) {
        return { ...item, children: updateQuestionRecursive(item.children, id, changes) }
      }
      return item
    })
  }, [])

  // Public update that works for nested questions as well
  const updateQuestionNested = useCallback((id, changes) => {
    setQuestions(prev => updateQuestionRecursive(prev, id, changes))
  }, [updateQuestionRecursive])

  // Use a rAF-driven smooth transform update for header/controls to avoid layout thrash
  const observerRef = useRef(null)
  const editorRef = useRef(null)
  
  useEffect(() => {
    if (!editorRef.current) return
    // IntersectionObserver to track which question is active for the sidebar
    const observer = new IntersectionObserver((entries) => {
      // find the entry with largest intersection ratio
      let best = null
      entries.forEach(e => {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e
      })
      if (best && best.target && best.target.id) {
        const id = best.target.id.replace(/^question-/, '')
        setActiveId(id)
      }
    }, { root: editorRef.current, rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] })
    observerRef.current = observer
    // observe existing question-form nodes
    const nodes = document.querySelectorAll('.question-form')
    nodes.forEach(n => {
      observer.observe(n)
      // populate questionRefs map for all existing nodes
      try {
        const id = n.id && n.id.replace(/^question-/, '')
        if (id) questionRefs.current[id] = n
      } catch (e) {}
    })

    // watch for DOM changes to (re)observe as questions added/removed
    const mo = new MutationObserver(() => {
      const all = document.querySelectorAll('.question-form')
      all.forEach(n => {
        try {
          observer.observe(n)
          const id = n.id && n.id.replace(/^question-/, '')
          if (id) questionRefs.current[id] = n
        } catch (e) {}
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mo.disconnect()
    }
  }, [questions])


  // Map of refs for question DOM nodes to support click-to-scroll and flash
  const questionRefs = useRef({})

  const scrollToQuestion = useCallback((id) => {
    let el = questionRefs.current[id]
    if (!el) el = document.getElementById(`question-${id}`)
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // add brief flash class to target card
      try {
        el.classList.add('flash-target')
        setTimeout(() => el.classList.remove('flash-target'), 900)
      } catch (e) {}
    }
  }, [])

  // Add child question under the question with given id
  const addChildQuestion = useCallback((parentId) => {
    const child = {
      id: uuidv4(),
      text: '',
      type: 'short',
      answer: '',
      children: []
    }
    const addRecursive = (items) => {
      return items.map(item => {
        if (item.id === parentId) {
          return { ...item, children: [...(item.children || []), child] }
        }
        if (item.children && item.children.length) {
          return { ...item, children: addRecursive(item.children) }
        }
        return item
      })
    }
    setQuestions(prev => addRecursive(prev))
  }, [])

  // Delete a question by id recursively (removes all nested children). Returns a new array.
  const deleteQuestion = useCallback((idToDelete) => {
    const deleteRecursive = (items) => {
      // Filter out any item that matches idToDelete, otherwise recurse into children
      return items.reduce((acc, item) => {
        if (item.id === idToDelete) return acc
        if (item.children && item.children.length) {
          const newChildren = deleteRecursive(item.children)
          acc.push({ ...item, children: newChildren })
        } else {
          acc.push(item)
        }
        return acc
      }, [])
    }
    setQuestions(prev => deleteRecursive(prev))
  }, [])

  return (
  <div className={`app-wrapper ${mode === 'user' ? 'mode-user' : ''} ${flipping ? 'flipping' : ''}`}>
      {/* Fixed header: title far-left, toggle + button far-right */}
      <header className="top-header">
        <div className="top-header-inner">
          {/* Title pinned left */}
          <div className="header-title-block">
            <h1 className="hero-title">Nested Form Builder</h1>
            <p className="hero-subtitle">Enterprise workflow — {mode === 'developer' ? 'Developer Mode' : 'User Mode'}</p>
          </div>

          {/* Slider + action button pinned right */}
          <div className="header-right-group">
            <div className="control-card">
              <div className="mode-labels">Developer</div>
              <label className="mode-toggle-slider">
                <input type="checkbox" checked={mode === 'user'} onChange={(e) => handleModeChange(e.target.checked)} />
                <span className="slider" />
              </label>
              <div className="mode-labels">User</div>
            </div>

            <div className="header-actions">
              {mode === 'developer' && (
                <button onClick={addQuestion} className="btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Question
                </button>
              )}
              {mode === 'user' && !submittedData && (
                <button className="btn-primary" onClick={() => { setSubmittedData(questions); setPreviewData(questions); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Submit
                </button>
              )}
              {mode === 'user' && submittedData && (
                <button className="btn-primary" style={{ backgroundColor: 'var(--muted)' }} onClick={() => setSubmittedData(null)}>
                  Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area with sidebar + questions */}
      <div className="app-body">
        <aside className="doc-sidebar-pane">
          <Sidebar items={questions} onSelect={(id) => scrollToQuestion(id)} activeId={activeId} />
        </aside>

        <div className="slide-door-container">
          {/* Left door overlay */}
          <div className="slide-door slide-door-left" />
          {/* Right door overlay */}
          <div className="slide-door slide-door-right" />

          <main ref={editorRef} className="editor-scroll-area">
            {submittedData ? (
              <div className="review-section">
                <div className="submitted-banner">
                  <h3>✓ Responses Submitted Successfully</h3>
                  <p>Please review your submission below.</p>
                </div>
                <div className="review-container">
                  <ReviewList items={submittedData} />
                </div>
              </div>
            ) : (
              <div className="questions-list">
                {questions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    </div>
                    <h3>No questions yet</h3>
                    <p>Click "Add Question" to start building your form</p>
                  </div>
                ) : (
                  <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
                    const { active, over } = e
                    if (!over) return
                    if (active.id === over.id) return

                    // Attempt to support both top-level and nested moves.
                    // Find source path and target path to decide behavior.
                    const src = findItemPath(questions, active.id)
                    const tgt = findItemPath(questions, over.id)
                    if (!src || !tgt) return

                    // If both are top-level (parentId == null), use arrayMove
                    if (!src.parentId && !tgt.parentId) {
                      const oldIndex = src.index
                      const newIndex = tgt.index
                      setQuestions(prev => arrayMove(prev, oldIndex, newIndex))
                      return
                    }

                    // Otherwise, move across parents: insert before the target item within its parent
                    const destParentId = tgt.parentId || null
                    const destIndex = tgt.index
                    setQuestions(prev => moveItemAcrossParents(prev, active.id, destParentId, destIndex))
                  }}>
                    <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                      {questions.map((q, idx) => {
                        // ensure a ref exists for this question id
                        if (!questionRefs.current[q.id]) questionRefs.current[q.id] = null
                        return (
                          <SortableQuestion
                            key={q.id}
                            id={q.id}
                            question={q}
                            index={idx}
                            questionRef={(el) => { questionRefs.current[q.id] = el }}
                            updateQuestion={updateQuestionNested}
                            addChildQuestion={addChildQuestion}
                            numbering={(idx + 1).toString()}
                            deleteQuestion={deleteQuestion}
                            mode={mode}
                          />
                        )
                      })}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

    </div>
  )
}
