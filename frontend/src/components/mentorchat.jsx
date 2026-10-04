import React, { useState } from 'react'

import {
  chatWithMentor,
  getApiErrorMessage,
} from '../services/api'

function MentorChat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi! I am VidyaMitra. Ask me about your resume, interviews, DSA, or learning priorities.',
    },
  ])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(event) {
    event.preventDefault()

    const text = message.trim()

    if (!text || loading) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: 'user',
        text: text,
      },
    ])

    setMessage('')
    setLoading(true)
    setError('')

    try {
      const response = await chatWithMentor(text)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'bot',
          text: response.response || 'I can help you with your career journey.',
        },
      ])
    } catch (error) {
      setError(getApiErrorMessage(error))
    }

    setLoading(false)
  }

  return (
    <section
      className="mentor-popover"
      aria-label="AI career mentor"
    >

      <div className="mentor-header">

        <div>
          <p className="mentor-title">
            VidyaMitra AI Mentor
          </p>

          <p className="mentor-status">
            Online - Career guidance
          </p>
        </div>

        <button
          type="button"
          className="mentor-close"
          onClick={onClose}
        >
          ×
        </button>

      </div>

      <div className="mentor-messages">

        {messages.map((item, index) => (
          <div
            key={index}
            className={`chat-bubble ${item.role}`}
          >
            {item.text}
          </div>
        ))}

      </div>

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

      <form
        className="mentor-form"
        onSubmit={handleSend}
      >

        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about your career..."
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? '...' : 'Send'}
        </button>

      </form>

    </section>
  )
}

export default MentorChat