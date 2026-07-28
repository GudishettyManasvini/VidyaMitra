import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 60000,
})

export const uploadResume = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const analyzeResume = async (resumeText, targetRole) => {
  const response = await api.post('/analyze', {
    resume_text: resumeText,
    target_role: targetRole,
  })
  return response.data
}

export const getCareerRecommendations = async (resumeText, targetRole) => {
  const response = await api.post('/career', {
    resume_text: resumeText,
    target_role: targetRole,
  })
  return response.data
}

export const getRoadmap = async (resumeText, targetRole) => {
  const response = await api.post('/roadmap', {
    resume_text: resumeText,
    target_role: targetRole,
  })
  return response.data
}

export const chatWithMentor = async (message) => {
  const response = await api.post('/chat', { message })
  return response.data
}

export const getApiErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }

  if (error.request) {
    return 'Unable to reach the FastAPI backend. Make sure it is running at http://127.0.0.1:8000.'
  }

  return error.message || 'Something went wrong while contacting the backend.'
}
