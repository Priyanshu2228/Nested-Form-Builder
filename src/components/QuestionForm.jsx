import React from 'react'
import QuestionItem from './QuestionItem'

export default function QuestionForm({ id, question, updateQuestion, addChildQuestion, numbering, deleteQuestion, mode, depth = 0, innerRef = null }) {
  // Wrapper that forwards update, addChild handlers and mode. Numbering passed from App.
  return (
    <div id={id} ref={innerRef} className="question-form">
      <QuestionItem
        question={question}
        updateQuestion={updateQuestion}
        addChildQuestion={addChildQuestion}
        numbering={numbering}
        deleteQuestion={deleteQuestion}
        mode={mode}
        depth={depth}
      />
    </div>
  )
}
