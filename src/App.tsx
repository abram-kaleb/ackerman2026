// File: App.tsx
import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Header from './components/Header'
import Monitor from './Monitor'
import Monitor2 from './Monitor2'
import Simulator from './Simulator'

// Inisialisasi Socket.io client ke server Express (port 5000)
const SOCKET_URL = 'http://localhost:5000'

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
})

function App() {
  const [isWidescreen, setIsWidescreen] = useState<boolean>(
    window.innerWidth > window.innerHeight
  )
  const [activePage, setActivePage] = useState<string>('monitor')

  // State untuk status koneksi server
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected)
  const [latency, setLatency] = useState<number>(0)

  // 1. Handling Resize Layar
  useEffect(() => {
    const handleResize = () => {
      setIsWidescreen(window.innerWidth > window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 2. Handling Event Socket.io (Koneksi Server)
  useEffect(() => {
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onDisconnect)

    // Pengukuran Latency/Ping berkala (setiap 5 detik)
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now()
        socket.emit('ping', () => {
          setLatency(Date.now() - start)
        })
      }
    }, 5000)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onDisconnect)
      clearInterval(pingInterval)
    }
  }, [])

  // 3. Render Komponen berdasarkan Active Page
  const renderContent = () => {
    if (activePage === 'simulator') {
      return <Simulator />
    }
    
    if (activePage === 'monitor') {
      return isWidescreen ? <Monitor /> : <Monitor2 />
    }

    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Halaman Maintenance
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-900 overflow-hidden">
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isConnected={isConnected}
        latency={latency}
        serverHost="localhost:5000"
      />
      
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export default App