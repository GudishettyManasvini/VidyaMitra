import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  uploadResume,
  analyzeResume,
  getCareerRecommendations,
  getRoadmap,
  getApiErrorMessage,
} from '../services/api'


const roles = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Cybersecurity Analyst',
]


function Upload() {

  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('Software Developer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  function selectFile(selectedFile) {

    if (!selectedFile) {
      return
    }

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Only PDF files are supported.')
      return
    }

    setFile(selectedFile)
    setError('')
  }


  function handleDrop(event) {

    event.preventDefault()

    const droppedFile = event.dataTransfer.files[0]

    selectFile(droppedFile)
  }


  async function handleSubmit() {

    if (!file) {
      setError('Please select your resume.')
      return
    }

    if (!targetRole) {
      setError('Please select a target role.')
      return
    }

    setLoading(true)
    setError('')


    try {

      // Upload the resume

      const uploadData = await uploadResume(file)

      const resumeText = uploadData.resume_text


      if (!resumeText) {
        setError('Could not read the resume.')
        setLoading(false)
        return
      }


      // Analyze the resume

      const analysis = await analyzeResume(
        resumeText,
        targetRole
      )


      // Get career recommendations

      const career = await getCareerRecommendations(
        resumeText,
        targetRole
      )


      // Get learning roadmap

      const roadmap = await getRoadmap(
        resumeText,
        targetRole
      )


      // Store all results

      const careerData = {

        targetRole: analysis.target_role,

        atsScore: analysis.ats_score,

        roleMatchScore: analysis.role_match_score,

        strengths: analysis.strengths || [],

        improvements: analysis.improvements || [],

        matchedSkills: analysis.matched_skills || [],

        missingSkills: analysis.missing_skills || [],

        prioritySkills: analysis.priority_skills || [],

        projectSuggestions:
          analysis.project_suggestions || [],

        feedback:
          analysis.feedback || '',

        careers:
          career.careers || [],

        roadmap:
          roadmap.roadmap || [],

      }


      sessionStorage.setItem(
        'careerData',
        JSON.stringify(careerData)
      )


      // Go to the report page

      navigate('/report')

    } catch (error) {

      setError(
        getApiErrorMessage(error)
      )

    }


    setLoading(false)
  }


  return (

    <main className="page-card">

      <div className="page-intro">

        <p className="eyebrow">
          Resume Scan
        </p>

        <h2>
          Upload your PDF resume and generate a career report.
        </h2>

        <p className="subtitle">
          VidyaMitra analyzes your resume and gives career guidance.
        </p>

      </div>


      <div className="role-selector">

        <label htmlFor="target-role">
          Choose your target role
        </label>


        <select
          id="target-role"
          value={targetRole}
          onChange={(event) =>
            setTargetRole(event.target.value)
          }
        >

          {roles.map((role) => (

            <option
              key={role}
              value={role}
            >
              {role}
            </option>

          ))}

        </select>

      </div>


      <div
        className="upload-zone"
        onDragOver={(event) =>
          event.preventDefault()
        }
        onDrop={handleDrop}
      >

        <p className="upload-title">
          Drag and drop your resume here
        </p>

        <p className="upload-subtitle">
          Accepted format: PDF
        </p>


        <label className="upload-btn">

          Browse File

          <input
            type="file"
            accept="application/pdf"
            onChange={(event) =>
              selectFile(event.target.files[0])
            }
          />

        </label>

      </div>


      {file && (

        <div className="file-summary">

          <p>
            <strong>File selected:</strong> {file.name}
          </p>

          <p>
            <strong>Size:</strong> {file.size} bytes
          </p>

        </div>

      )}


      {error && (

        <p className="error-text">
          {error}
        </p>

      )}


      <button
        className="primary-btn"
        onClick={handleSubmit}
        disabled={loading}
      >

        {loading
          ? 'Analysing your resume...'
          : 'Generate My Career Report'}

      </button>

    </main>

  )
}


export default Upload