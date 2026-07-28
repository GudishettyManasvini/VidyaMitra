import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import {
  analyzeResume,
  chatWithMentor,
  getApiErrorMessage,
  getCareerRecommendations,
  getRoadmap,
  uploadResume,
} from './services/api'

const demoCareerData = {
  targetRole: 'Software Developer',
  atsScore: 82,
  roleMatchScore: 78,
  strengths: [
    'Strong Python and Java programming foundation',
    'Relevant full-stack project experience',
    'Good academic consistency',
  ],
  improvements: [
    'Add measurable results to project descriptions',
    'Use more role-specific ATS keywords',
    'Add a concise professional summary',
  ],
  missingSkills: ['Docker', 'REST API Testing', 'Cloud Deployment', 'Data Structures'],
  matchedSkills: ['Python', 'Java', 'Git', 'Problem solving'],
  prioritySkills: [
    { skill: 'Data Structures and Algorithms', priority: 'High', reason: 'Essential for technical interviews.' },
    { skill: 'REST APIs', priority: 'High', reason: 'Required for most software projects.' },
  ],
  projectSuggestions: ['Build and deploy a full-stack task manager.', 'Create a REST API with authentication.'],
  feedback: 'You have a promising entry-level profile. Tailor the resume to each job description and quantify your project contributions.',
  careers: [
    { role: 'Software Developer', fit: 90, reason: 'Your programming and web development skills are a strong match for this role.', skills: ['React', 'FastAPI', 'SQL', 'DSA'] },
    { role: 'Data Analyst', fit: 78, reason: 'Your Python foundation can be extended into practical data analysis.', skills: ['SQL', 'Excel', 'Power BI', 'Pandas'] },
    { role: 'AI/ML Engineer', fit: 72, reason: 'Your interest in AI APIs gives you a good path into applied AI.', skills: ['Python', 'Machine Learning', 'APIs', 'MLOps'] },
  ],
  roadmap: [
    { week: 'Weeks 1–4', title: 'Strengthen Foundations', tasks: ['Practice DSA for one hour daily', 'Revise Python, SQL and Git', 'Improve resume based on AI feedback'] },
    { week: 'Weeks 5–8', title: 'Build and Deploy', tasks: ['Build one full-stack project', 'Learn API testing', 'Deploy your project on Render or Vercel'] },
    { week: 'Weeks 9–12', title: 'Placement Preparation', tasks: ['Take coding mock tests', 'Practice technical interview questions', 'Apply for suitable entry-level roles'] },
  ],
}

const featureCards = [
  { title: 'AI Resume Analysis', description: 'Get instant insights into your strengths, keywords, and professional story.' },
  { title: 'Skill Gap Analysis', description: 'Discover the capabilities you need to close the gap between your profile and target roles.' },
  { title: 'Career Recommendations', description: 'Receive tailored role suggestions aligned with your goals, background, and potential.' },
  { title: 'Learning Roadmap', description: 'Turn recommendations into a clear plan with focused milestones and learning steps.' },
]

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Resume Scan', to: '/upload' },
  { label: 'Career Report', to: '/report' },
  { label: 'Roadmap', to: '/roadmap' },
]

const defaultMentorMessages = [
  { role: 'bot', text: 'Hi! I am VidyaMitra. Ask me about your resume, interviews, DSA, or learning priorities.' },
]

function asList(value, fallback = []) {
  return Array.isArray(value) ? value : fallback
}

function displayText(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object') return value.skill || value.title || value.name || value.description || JSON.stringify(value)
  return ''
}

function getStoredCareerData() {
  if (typeof window === 'undefined') return demoCareerData
  try {
    const stored = window.sessionStorage.getItem('careerData')
    return stored ? JSON.parse(stored) : demoCareerData
  } catch {
    return demoCareerData
  }
}

function getStoredMentorMessages() {
  if (typeof window === 'undefined') return defaultMentorMessages
  try {
    const stored = window.sessionStorage.getItem('mentorChat')
    const messages = stored ? JSON.parse(stored) : defaultMentorMessages
    return Array.isArray(messages) && messages.length ? messages : defaultMentorMessages
  } catch {
    return defaultMentorMessages
  }
}

function normalizeCareerData(rawData) {
  if (!rawData || typeof rawData !== 'object') return demoCareerData

  return {
    ...demoCareerData,
    ...rawData,
    targetRole: rawData.target_role ?? rawData.targetRole ?? demoCareerData.targetRole,
    atsScore: rawData.ats_score ?? rawData.atsScore ?? demoCareerData.atsScore,
    roleMatchScore: rawData.role_match_score ?? rawData.roleMatchScore ?? demoCareerData.roleMatchScore,
    strengths: asList(rawData.strengths, demoCareerData.strengths),
    improvements: asList(rawData.improvements ?? rawData.weaknesses, demoCareerData.improvements),
    missingSkills: asList(rawData.missing_skills ?? rawData.missingSkills, demoCareerData.missingSkills),
    matchedSkills: asList(rawData.matched_skills ?? rawData.matchedSkills, demoCareerData.matchedSkills),
    prioritySkills: asList(rawData.priority_skills ?? rawData.prioritySkills, demoCareerData.prioritySkills),
    projectSuggestions: asList(rawData.project_suggestions ?? rawData.projectSuggestions, demoCareerData.projectSuggestions),
    careers: asList(rawData.careers, demoCareerData.careers),
    roadmap: asList(rawData.roadmap, demoCareerData.roadmap),
    feedback: rawData.feedback || demoCareerData.feedback,
  }
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  return <BrowserRouter><AppShell /></BrowserRouter>
}

function AppShell() {
  const navigate = useNavigate()
  const [careerData, setCareerData] = useState(getStoredCareerData)
  const [mentorOpen, setMentorOpen] = useState(false)

  useEffect(() => {
    window.sessionStorage.setItem('careerData', JSON.stringify(careerData))
  }, [careerData])

  const saveCareerData = (data) => setCareerData(data)

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">V</span><span>VidyaMitra</span>
        </NavLink>
        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage navigate={navigate} />} />
        <Route path="/upload" element={<UploadPage saveCareerData={saveCareerData} navigate={navigate} />} />
        <Route path="/report" element={<ReportPage careerData={careerData} navigate={navigate} />} />
        <Route path="/roadmap" element={<RoadmapPage careerData={careerData} openMentor={() => setMentorOpen(true)} />} />
        <Route path="*" element={<HomePage navigate={navigate} />} />
      </Routes>

      <MentorWidget isOpen={mentorOpen} setIsOpen={setMentorOpen} />
    </div>
  )
}

function HomePage({ navigate }) {
  return (
    <main className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Intelligent Career Agent</p>
        <h1>Turn Your Potential Into a Career Plan.</h1>
        <p className="subtitle">Discover how AI-powered resume evaluation, personalised career recommendations, and guided learning plans can help you move forward with confidence.</p>
        <div className="hero-actions">
          <button type="button" className="primary-btn" onClick={() => navigate('/upload')}>Analyse My Resume</button>
          <a href="#features" className="secondary-link">Explore Features</a>
        </div>
        <div className="hero-pills"><span>AI-guided insights</span><span>Career clarity</span><span>Personalised roadmap</span></div>
      </div>
      <div className="hero-panel" aria-label="Career insights preview">
        <div className="panel-card">
          <p className="panel-label">Resume Snapshot</p>
          <ul><li><strong>Skills matched:</strong> 86%</li><li><strong>Strongest area:</strong> Problem solving</li><li><strong>Next best move:</strong> Product analytics</li></ul>
        </div>
      </div>
      <section id="features" className="features-section">
        <div className="section-heading"><p className="eyebrow">Why students choose VidyaMitra</p><h2>Turn your profile into a focused career direction.</h2></div>
        <div className="features-grid">{featureCards.map((card) => <article key={card.title} className="feature-card"><h3>{card.title}</h3><p>{card.description}</p></article>)}</div>
      </section>
    </main>
  )
}

function UploadPage({ saveCareerData, navigate }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelection = (file) => {
    if (!file) return
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) { setError('Only PDF files are supported for resume upload.'); return }
    setError('')
    setSelectedFile({ name: file.name, size: file.size, file })
  }

  const handleSubmit = async () => {
    if (!selectedFile?.file) return
    if (!targetRole) { setError('Please choose your target role before generating the report.'); return }
    setIsLoading(true); setError('')
    try {
      const uploadResponse = await uploadResume(selectedFile.file)
      const resumeText = uploadResponse.resume_text
      if (!resumeText?.trim()) throw new Error('The uploaded resume did not contain readable text.')
      const [analysisResponse, careerResponse, roadmapResponse] = await Promise.all([
        analyzeResume(resumeText, targetRole), getCareerRecommendations(resumeText, targetRole), getRoadmap(resumeText, targetRole),
      ])
      saveCareerData({
        ...demoCareerData, ...analysisResponse,
        targetRole: analysisResponse.target_role ?? targetRole,
        atsScore: analysisResponse.ats_score ?? analysisResponse.atsScore ?? demoCareerData.atsScore,
        roleMatchScore: analysisResponse.role_match_score ?? analysisResponse.roleMatchScore ?? demoCareerData.roleMatchScore,
        missingSkills: analysisResponse.missing_skills ?? analysisResponse.missingSkills ?? demoCareerData.missingSkills,
        matchedSkills: analysisResponse.matched_skills ?? analysisResponse.matchedSkills ?? demoCareerData.matchedSkills,
        prioritySkills: analysisResponse.priority_skills ?? analysisResponse.prioritySkills ?? demoCareerData.prioritySkills,
        projectSuggestions: analysisResponse.project_suggestions ?? analysisResponse.projectSuggestions ?? demoCareerData.projectSuggestions,
        improvements: analysisResponse.improvements ?? analysisResponse.weaknesses ?? demoCareerData.improvements,
        careers: careerResponse.careers || demoCareerData.careers,
        roadmap: roadmapResponse.roadmap || demoCareerData.roadmap,
        feedback: analysisResponse.feedback || demoCareerData.feedback,
        strengths: analysisResponse.strengths || demoCareerData.strengths,
      })
      navigate('/report')
    } catch (err) { setError(getApiErrorMessage(err)) } finally { setIsLoading(false) }
  }

  return (
    <main className="page-card">
      <div className="page-intro"><p className="eyebrow">Resume Scan</p><h2>Upload your PDF resume and generate a tailored career report.</h2><p className="subtitle">VidyaMitra uses your uploaded resume text and live AI insights to create a practical career plan.</p></div>
      <div className="role-selector">
        <label htmlFor="target-role">Choose your target role</label>
        <select id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
          <option value="">Select a role</option><option>Software Developer</option><option>Frontend Developer</option><option>Backend Developer</option><option>Full Stack Developer</option><option>Data Analyst</option><option>Data Scientist</option><option>AI/ML Engineer</option><option>UI/UX Designer</option><option>Cybersecurity Analyst</option>
        </select>
      </div>
      <div className={`upload-zone ${dragActive ? 'drag-active' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); handleFileSelection(event.dataTransfer.files[0]) }}>
        <p className="upload-title">Drag and drop your resume here</p><p className="upload-subtitle">Accepted format: PDF</p>
        <label className="upload-btn">Browse File<input type="file" accept="application/pdf" onChange={(event) => handleFileSelection(event.target.files?.[0])} /></label>
      </div>
      {error && <p className="error-text">{error}</p>}
      {selectedFile && <div className="file-summary"><p><strong>File selected:</strong> {selectedFile.name}</p><p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p></div>}
      <button type="button" className="primary-btn" onClick={handleSubmit} disabled={!selectedFile || !targetRole || isLoading}>{isLoading ? 'Analysing your resume with AI…' : 'Generate My Career Report'}</button>
    </main>
  )
}

function ReportPage({ careerData, navigate }) {
  const data = normalizeCareerData(careerData)
  return (
    <main className="page-card report-page">
      <div className="page-intro"><p className="eyebrow">Career Report</p><h2>Your AI-powered {data.targetRole} assessment is ready.</h2></div>
      <div className="report-grid">
        <section className="report-panel"><div className="score-ring" style={{ background: `conic-gradient(#1f6feb ${data.atsScore}%, #e8edff 0)` }}><span>{data.atsScore}</span></div><h3>ATS Score</h3><p>Strong resume alignment for entry-level technical roles.</p></section>
        <section className="report-panel"><div className="score-ring" style={{ background: `conic-gradient(#7c3aed ${data.roleMatchScore}%, #e8edff 0)` }}><span>{data.roleMatchScore}</span></div><h3>{data.targetRole} Match</h3><p>How closely your current resume aligns with your selected target role.</p></section>
        <ListPanel title="Strengths" items={data.strengths} />
        <ListPanel title="Improvement Areas" items={data.improvements} />
        <ListPanel title="Missing Skills" items={data.missingSkills} />
      </div>
      <section className="report-panel wide-panel"><h3>Overall Feedback</h3><p>{data.feedback}</p></section>
      <div className="report-grid">
        <section className="report-panel"><h3>Relevant Skills You Already Have</h3><div className="skill-tags">{data.matchedSkills.map((skill, index) => <span key={`${displayText(skill)}-${index}`}>{displayText(skill)}</span>)}</div></section>
        <section className="report-panel"><h3>Learn These First</h3><ul>{data.prioritySkills.map((item, index) => <li key={`${displayText(item)}-${index}`}><strong>{displayText(item)}</strong>{item?.reason ? ` — ${item.reason}` : ''}</li>)}</ul></section>
      </div>
      <section className="report-panel wide-panel"><h3>Portfolio Projects for {data.targetRole}</h3><ul>{data.projectSuggestions.map((project, index) => <li key={`${displayText(project)}-${index}`}>{displayText(project)}</li>)}</ul></section>
      <section className="career-cards">{data.careers.map((career, index) => <article key={`${career.role}-${index}`} className="career-card"><div className="career-fit">{career.fit}% fit</div><h3>{career.role}</h3><p>{career.reason}</p><div className="skill-tags">{asList(career.skills).map((skill, skillIndex) => <span key={`${skill}-${skillIndex}`}>{skill}</span>)}</div></article>)}</section>
      <button type="button" className="primary-btn" onClick={() => navigate('/roadmap')}>View My 12-Week Roadmap</button>
    </main>
  )
}

function ListPanel({ title, items }) {
  return <section className="report-panel"><h3>{title}</h3><ul>{items.map((item, index) => <li key={`${displayText(item)}-${index}`}>{displayText(item)}</li>)}</ul></section>
}

function RoadmapPage({ careerData, openMentor }) {
  const data = normalizeCareerData(careerData)
  return (
    <main className="page-card">
      <div className="page-intro"><p className="eyebrow">Learning Roadmap</p><h2>Your personalised 12-week growth journey.</h2></div>
      <div className="timeline">{data.roadmap.map((phase, index) => <article key={`${phase.week}-${index}`} className="timeline-card"><div className="timeline-marker" /><div><p className="timeline-week">{phase.week}</p><h3>{phase.title}</h3><ul>{asList(phase.tasks).map((task, taskIndex) => <li key={`${task}-${taskIndex}`}>{task}</li>)}</ul></div></article>)}</div>
      <button type="button" className="primary-btn" onClick={openMentor}>Talk to AI Mentor</button>
    </main>
  )
}

function MentorWidget({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState(getStoredMentorMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { window.sessionStorage.setItem('mentorChat', JSON.stringify(messages)) }, [messages])

  const handleSend = async (event) => {
    event.preventDefault()
    const trimmedMessage = draft.trim()
    if (!trimmedMessage || isSending) return
    const userMessage = { role: 'user', text: trimmedMessage }
    setMessages((current) => [...current, userMessage])
    setDraft(''); setIsSending(true); setError('')
    try {
      const response = await chatWithMentor(trimmedMessage)
      setMessages((current) => [...current, { role: 'bot', text: response.response || 'I can help with your next step.' }])
    } catch (err) { setError(getApiErrorMessage(err)) } finally { setIsSending(false) }
  }

  return (
    <div className="mentor-widget">
      {isOpen && <section className="mentor-popover" aria-label="AI career mentor">
        <div className="mentor-header"><div><p className="mentor-title">VidyaMitra AI Mentor</p><p className="mentor-status">Online - Career guidance</p></div><button type="button" className="mentor-close" onClick={() => setIsOpen(false)} aria-label="Close mentor chat">×</button></div>
        <div className="mentor-messages">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>{message.text}</div>)}</div>
        {error && <p className="error-text">{error}</p>}
        <form className="mentor-form" onSubmit={handleSend}><input type="text" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about your career..." aria-label="Message the AI mentor" /><button type="submit" disabled={isSending}>{isSending ? '...' : 'Send'}</button></form>
      </section>}
      <button type="button" className="mentor-fab" onClick={() => setIsOpen((open) => !open)} aria-label="Open AI mentor chat">{isOpen ? '×' : 'AI'}</button>
    </div>
  )
}

export default App
