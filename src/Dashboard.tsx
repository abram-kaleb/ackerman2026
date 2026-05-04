import React, { useState } from 'react'
import Box1 from './components/Canvas'
import Box2 from './components/Room'
import Box3 from './components/Gauge'
import Box4 from './components/Maintenance'
import Box5 from './components/Trend'
import Box6 from './components/Alarm'
import Box7 from './components/Anomalies'
import Box8 from './components/ChatBot'

const Dashboard = ({ children }: { children?: React.ReactNode }) => {
  const [fs, setFs] = useState<number | null>(null)

  const boxes = [
    { id: 1, Component: Box1, s: "left-[27%] top-[1%] w-[46%] h-[60%] z-99" }, //canvas
    { id: 2, Component: Box2, s: "left-[27%] top-[1%] w-[46%] h-[60%]" }, //room
    { id: 3, Component: Box3, s: "left-[0.5%] bottom-[2%] top-[1%] w-[26%] h-[98%]" }, //gauge
    // { id: 4, Component: Box4, s: "left-0 top-0 w-[25%] h-[50%]" }, //maintenance
    { id: 5, Component: Box5, s: "left-[27%] bottom-[1%] w-[46%] h-[37%]" }, //trendchart
    { id: 6, Component: Box6, s: "right-[0.5%] top-[1%] w-[26%] h-[32%]" }, //alarm
    { id: 7, Component: Box7, s: "right-[0.5%] top-[34%] w-[26%] h-[65%]" }, //anomalies
    // { id: 8, Component: Box8, s: "right-[1%] top-[70%] w-[26%] h-[28%]" }, //chatbot
  ]
return (
    <div className="relative h-screen w-full bg-[#121212] text-slate-300 overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        *::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />

      <main className="relative w-full h-[calc(100vh-3rem)] p-2">
        {boxes.map(({ id, Component, s }) => {
          const isFs = fs === id
          return (
            <div
              key={id}
              className={`absolute p-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isFs 
                ? "inset-0 z-50 w-full h-full p-0" 
                : `${s} ${fs !== null ? "opacity-0 scale-95 pointer-events-none" : "z-10"}`
              }`}
            >
              <div className="relative w-full h-full group overflow-hidden">
                <button
                  onClick={() => setFs(isFs ? null : id)}
                  className="absolute top-2 right-2 z-[60] bg-slate-900/80 hover:bg-slate-800 text-slate-400 p-1.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isFs ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  )}
                </button>
                <Component />
              </div>
            </div>
          )
        })}
        {children}
      </main>
    </div>
  )
}

export default Dashboard