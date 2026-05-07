import React from 'react'

const ReviewList = ({ items, numbering = '' }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="review-list">
      {items.map((item, idx) => {
        const currentNumbering = numbering ? `${numbering}.${idx + 1}` : `${idx + 1}`
        return (
          <div key={item.id} className="review-item">
            <div className="review-item-header">
              <span className="review-item-number">{currentNumbering}</span>
              <span className="review-item-title">{item.text || 'Untitled question'}</span>
            </div>
            <div className="review-item-answer">
              <span className="review-answer-label">Answer:</span>
              <span className="review-answer-value">
                {item.answer ? item.answer : <span className="unanswered">Not answered</span>}
              </span>
            </div>
            {item.children && item.children.length > 0 && (
              <div className="review-item-children">
                <ReviewList items={item.children} numbering={currentNumbering} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ReviewList
