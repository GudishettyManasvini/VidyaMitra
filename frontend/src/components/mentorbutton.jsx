import React, { useState } from 'react'
import MentorChat from './MentorChat'

function MentorButton() {
  const [isOpen, setIsOpen] = useState(false)

  function openMentor() {
    setIsOpen(true)
  }

  function closeMentor() {
    setIsOpen(false)
  }

  return (
    <div className="mentor-widget">

      {isOpen && (
        <MentorChat onClose={closeMentor} />
      )}

      <button
        type="button"
        className="mentor-fab"
        onClick={openMentor}
      >
        {isOpen ? '×' : 'AI Mentor'}
      </button>

    </div>
  )
}

export default MentorButton