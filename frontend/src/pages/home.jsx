import React from 'react'
import { useNavigate } from 'react-router-dom'


function Home() {

  const navigate = useNavigate()


  return (

    <main className="hero-section">

      <div className="hero-copy">

        <p className="eyebrow">
          Intelligent Career Agent
        </p>

        <h1>
          Turn Your Potential Into a Career Plan.
        </h1>

        <p className="subtitle">
          Upload your resume and get AI-based career
          recommendations, skill gap analysis and a learning roadmap.
        </p>


        <div className="hero-actions">

          <button
            className="primary-btn"
            onClick={() => navigate('/upload')}
          >
            Analyse My Resume
          </button>

          <a
            href="#features"
            className="secondary-link"
          >
            Explore Features
          </a>

        </div>


        <div className="hero-pills">

          <span>
            AI-guided insights
          </span>

          <span>
            Career clarity
          </span>

          <span>
            Personalised roadmap
          </span>

        </div>

      </div>


      <div className="hero-panel">

        <div className="panel-card">

          <p className="panel-label">
            Resume Snapshot
          </p>

          <ul>

            <li>
              <strong>Skills matched:</strong>
              Based on your resume
            </li>

            <li>
              <strong>Strongest area:</strong>
              Your current skills
            </li>

            <li>
              <strong>Next best move:</strong>
              Improve your skill gaps
            </li>

          </ul>

        </div>

      </div>


      <section
        id="features"
        className="features-section"
      >

        <div className="section-heading">

          <p className="eyebrow">
            Why students choose VidyaMitra
          </p>

          <h2>
            Turn your profile into a focused career direction.
          </h2>

        </div>


        <div className="features-grid">

          <div className="feature-card">

            <h3>
              AI Resume Analysis
            </h3>

            <p>
              Get insights into your resume and skills.
            </p>

          </div>


          <div className="feature-card">

            <h3>
              Skill Gap Analysis
            </h3>

            <p>
              Find the skills you need for your target role.
            </p>

          </div>


          <div className="feature-card">

            <h3>
              Career Recommendations
            </h3>

            <p>
              Get career suggestions based on your resume.
            </p>

          </div>


          <div className="feature-card">

            <h3>
              Learning Roadmap
            </h3>

            <p>
              Get a simple learning plan for your career goal.
            </p>

          </div>

        </div>

      </section>

    </main>

  )
}


export default Home