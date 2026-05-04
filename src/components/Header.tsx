import React, { useState } from 'react'
import { Menu, LineChart, Settings, Bell, User, LayoutDashboard, Zap, Wrench } from 'lucide-react'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Simulation', icon: <Zap size={16} /> },
    { name: 'Maintenance', icon: <Wrench size={16} /> }
  ]

  return (
    <header className="relative flex items-center justify-between px-4 h-12 bg-[#121212] text-slate-300">
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
                    key={item.name}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
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
          <span className="text-slate-500">|</span>
          <span className="text-sm text-slate-400 uppercase">
            Dashboard
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <LineChart size={18} className="cursor-pointer hover:text-white" />
        <Settings size={18} className="cursor-pointer hover:text-white" />
        
        <div className="relative cursor-pointer hover:text-white">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
            1
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center cursor-pointer overflow-hidden border border-slate-600">
          <User size={20} className="text-slate-400 mt-1" />
        </div>
      </div>
    </header>
  )
}

export default Header