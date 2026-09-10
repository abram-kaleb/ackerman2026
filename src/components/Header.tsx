import React, { useState } from 'react'
import { Menu, LayoutDashboard, Zap, Wrench, Wifi, WifiOff } from 'lucide-react'

interface HeaderProps {
  activePage: string
  setActivePage: (page: string) => void
  isConnected: boolean // Status koneksi real-time dari Socket.io
  latency?: number      // Latensi opsional (ms)
  serverHost?: string   // Nama/Host server
}

const Header: React.FC<HeaderProps> = ({ 
  activePage, 
  setActivePage,
  isConnected,
  latency = 0,
  serverHost = "localhost:5000"
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'monitor', name: 'Monitor', icon: <LayoutDashboard size={16} /> },
    { id: 'simulator', name: 'Simulator', icon: <Zap size={16} /> },
    { id: 'maintenance', name: 'Maintenance', icon: <Wrench size={16} /> }
  ]

  const handleSelectPage = (id: string) => {
    setActivePage(id)
    setIsOpen(false)
  }

  return (
    <header className="relative flex items-center justify-between px-4 h-12 bg-[#121212] text-slate-300 select-none border-b border-slate-800">
      {/* SISI KIRI: MENU DROPDOWN & NAMA HALAMAN */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Menu 
            size={18} 
            className="cursor-pointer hover:text-white transition-colors" 
            onClick={() => setIsOpen(!isOpen)}
          />
          
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)} 
              />
              <div className="absolute top-10 left-0 w-48 bg-black border border-slate-800 rounded-md shadow-xl z-20 py-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
                      activePage === item.id 
                        ? 'bg-slate-800 text-white font-medium' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => handleSelectPage(item.id)}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold tracking-tight text-white uppercase">
            Ackerman
          </h1>
          <span className="text-slate-600">|</span>
          <span className="text-sm text-slate-400 uppercase tracking-wide">
            {activePage}
          </span>
        </div>
      </div>

      {/* SISI KANAN: INDIKATOR KONEKSI SERVER REAL-TIME */}
      <div className={`flex items-center gap-3 px-3 py-1 rounded-full border transition-all duration-300 ${
        isConnected 
          ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400' 
          : 'bg-rose-950/30 border-rose-800/50 text-rose-400 animate-pulse'
      }`}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi size={14} className="text-emerald-400" />
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <WifiOff size={14} className="text-rose-400" />
            </>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-slate-800 pl-2 text-xs">
          <span className="text-slate-400 font-mono hidden sm:inline">{serverHost}</span>
          <span className="font-semibold tracking-wider">
            {isConnected ? 'ONLINE' : 'DISCONNECTED'}
          </span>
          {isConnected && latency > 0 && (
            <span className="text-slate-500 font-mono text-[10px]">
              {latency}ms
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header