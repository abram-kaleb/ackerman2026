import React, { useState, useRef } from 'react'
import Box1 from './components/Canvas'
import Box2 from './components/Room'
import Box3 from './components/Gauge'
import Box4 from './components/Maintenance'
import Box5 from './components/Trend'
import Box6 from './components/Alarm'
import Box7 from './components/Anomalies'
import Box8 from './components/ChatBot'

const Dashboard2 = ({ children }: { children?: React.ReactNode }) => {
  const [fs, setFs] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const boxes = [
    { id: 2, Component: Box2, label: "Room" },
    { id: 3, Component: Box3, label: "Gauge" },
    { id: 5, Component: Box5, label: "Trend" },
    { id: 6, Component: Box6, label: "Alarm" },
    { id: 7, Component: Box7, label: "Anomalies" },
  ]

  const scrollToBox = (id: number) => {
    const element = document.getElementById(`box-${id}`)
    if (element && scrollRef.current) {
      element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  const renderBox = (id: number, Component: any, s: string) => {
    const isFs = fs === id
    return (
      <div
        key={id}
        id={`box-${id}`}
        className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isFs
            ? "fixed inset-0 z-50 w-screen h-screen bg-[#121212] p-0"
            : `relative shrink-0 ${s} ${fs !== null && fs !== id ? "opacity-0 scale-95 pointer-events-none" : "z-10"}`
        }`}
      >
        <div className="relative w-full h-full group overflow-hidden rounded-lg border border-slate-800 bg-[#1a1a1a]">
          <button
            onClick={() => setFs(isFs ? null : id)}
            className="absolute top-2 right-2 z-[60] bg-slate-900/80 hover:bg-slate-800 text-slate-400 p-2 rounded border border-slate-700 transition-opacity"
          >
            {isFs ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            )}
          </button>
          <Component />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-[#121212] text-slate-300 select-none overflow-hidden flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        *::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />

      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="w-full shrink-0">
          {renderBox(1, Box1, "w-full h-[250px]")}
        </div>

        <div 
          ref={scrollRef}
          className="flex flex-1 flex-row gap-4 overflow-x-auto pb-4 items-start"
        >
          {boxes.map(({ id, Component }) => renderBox(id, Component, "w-[300px] h-full"))}
          {children}
        </div>
      </main>

      <nav className="h-16 border-t border-slate-800 bg-[#121212] flex items-center justify-center gap-2 px-4 shrink-0">
        {boxes.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollToBox(id)}
            className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-medium hover:bg-slate-800 hover:border-slate-500 transition-all active:scale-95"
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Dashboard2