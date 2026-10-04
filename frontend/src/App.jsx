import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navigation from './components/Navigation'

import Home from './pages/home'
import Upload from './pages/upload'
import Report from './pages/report'
import Roadmap from './pages/roadmap'

function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/report" element={<Report />} />
        <Route path="/roadmap" element={<Roadmap />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App