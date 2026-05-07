import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import QuestionForm from './QuestionForm'

export default function SortableQuestion({ id, question, index, questionRef = null, ...rest }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    zIndex: isDragging ? 9999 : 'auto'
  }
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'question-node-wrapper dragging' : 'question-node-wrapper'} {...attributes}>
      <div className="drag-handle" {...listeners} title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M10 6h4" stroke="#556072" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 12h4" stroke="#556072" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 18h4" stroke="#556072" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <QuestionForm id={id} question={question} innerRef={questionRef} {...rest} />
    </div>
  )
}
