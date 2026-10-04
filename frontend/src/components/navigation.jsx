import React from 'react'
import { Link } from 'react-router-dom'


function Navigation() {

  return (

    <nav className="topbar">

      <Link to="/" className="brand">

        <span className="brand-mark">
          V
        </span>

        <span>
          VidyaMitra
        </span>

      </Link>


      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/upload">
          Resume Scan
        </Link>

        <Link to="/report">
          Career Report
        </Link>

        <Link to="/roadmap">
          Roadmap
        </Link>

      </div>

    </nav>

  )
}


export default Navigation