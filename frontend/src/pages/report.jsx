import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import List from '../components/list'
import MentorButton from '../components/mentorbutton'

function Report() {
  const navigate = useNavigate()
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
        <h2>No career report available.</h2>

        <button
          className="primary-btn"
          onClick={() => navigate('/upload')}
        >
          Upload Resume
        </button>
      </main>
    )
  }

  return (
    <main className="page-card report-page">

      <div className="page-intro">
        <p className="eyebrow">Career Report</p>

        <h2>
          Your {data.targetRole} assessment is ready.
        </h2>
      </div>

      <div className="report-grid">

        <section className="report-panel">
          <div
            className="score-ring"
            style={{
              background: `conic-gradient(#1f6feb ${data.atsScore}%, #e8edff 0)`
            }}
          >
            <span>{data.atsScore}</span>
          </div>

          <h3>ATS Score</h3>

          <p>
            Your resume score based on the AI analysis.
          </p>
        </section>

        <section className="report-panel">
          <div
            className="score-ring"
            style={{
              background: `conic-gradient(#7c3aed ${data.roleMatchScore}%, #e8edff 0)`
            }}
          >
            <span>{data.roleMatchScore}</span>
          </div>

          <h3>{data.targetRole} Match</h3>

          <p>
            How closely your resume matches your selected role.
          </p>
        </section>

        <List
          title="Strengths"
          items={data.strengths}
        />

        <List
          title="Improvement Areas"
          items={data.improvements}
        />

        <List
          title="Missing Skills"
          items={data.missingSkills}
        />

      </div>

      <section className="report-panel wide-panel">
        <h3>Overall Feedback</h3>

        <p>{data.feedback}</p>
      </section>

      <section className="report-panel">
        <h3>Relevant Skills You Already Have</h3>

        <div className="skill-tags">
          {data.matchedSkills.map((skill, index) => (
            <span key={index}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="report-panel">
        <h3>Learn These First</h3>

        <ul>
          {data.prioritySkills.map((skill, index) => (
            <li key={index}>
              <strong>
                {skill.skill || skill}
              </strong>

              {skill.reason && ` - ${skill.reason}`}
            </li>
          ))}
        </ul>
      </section>

      <section className="report-panel wide-panel">
        <h3>
          Portfolio Projects for {data.targetRole}
        </h3>

        <ul>
          {data.projectSuggestions.map((project, index) => (
            <li key={index}>
              {project}
            </li>
          ))}
        </ul>
      </section>

      <section className="career-cards">
        {data.careers.map((career, index) => (
          <article
            key={index}
            className="career-card"
          >
            <div className="career-fit">
              {career.fit}% fit
            </div>

            <h3>{career.role}</h3>

            <p>{career.reason}</p>

            <div className="skill-tags">
              {career.skills &&
                career.skills.map((skill, skillIndex) => (
                  <span key={skillIndex}>
                    {skill}
                  </span>
                ))}
            </div>
          </article>
        ))}
      </section>

      <button
        className="primary-btn"
        onClick={() => navigate('/roadmap')}
      >
        View My 12-Week Roadmap
      </button>

      <MentorButton />

    </main>
  )
}

export default Report