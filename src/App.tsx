import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './Dashboard'
import Dashboard2 from './Dashboard2'

function App() {
  const [isWidescreen, setIsWidescreen] = useState(window.innerWidth > window.innerHeight)

  useEffect(() => {
    const handleResize = () => {
      setIsWidescreen(window.innerWidth > window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col">
      <Header />
      {isWidescreen ? <Dashboard /> : <Dashboard2 />}
    </div>
  )
}

export default App