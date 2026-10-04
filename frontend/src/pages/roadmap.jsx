import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MentorButton from '../components/mentorbutton'

function Roadmap() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const savedData = sessionStorage.getItem('careerData')

    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  if (!data) {
    return (
      <main className="page-card">

        <h2>
          No roadmap available.
        </h2>

        <Link to="/upload">
          Upload Resume
        </Link>

      </main>
    )
  }

  return (
    <main className="page-card">

      <div className="page-intro">

        <p className="eyebrow">
          Learning Roadmap
        </p>

        <h2>
          Your personalised 12-week learning plan.
        </h2>

      </div>

      <div className="timeline">

        {data.roadmap.map((phase, index) => (
          <article
            key={index}
            className="timeline-card"
          >

            <div className="timeline-marker" />

            <div>

              <p className="timeline-week">
                {phase.week}
              </p>

              <h3>
                {phase.title}
              </h3>

              <ul>

                {phase.tasks.map((task, taskIndex) => (
                  <li key={taskIndex}>
                    {task}
                  </li>
                ))}

              </ul>

            </div>

          </article>
        ))}

      </div>

      <MentorButton />

    </main>
  )
}

export default Roadmap