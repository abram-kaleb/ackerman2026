import React from 'react'
import Header from './components/Header'
import Box1 from './components/Canvas'
import Box2 from './components/Room'
import Box3 from './components/Gauge'
import Box4 from './components/Maintenance'
import Box5 from './components/Trend'
import Box6 from './components/Alarm'
import Box7 from './components/Anomalies'
import Box8 from './components/ChatBot'

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 p-2 gap-2 overflow-hidden">
      <Header />

      <div className="grid grid-cols-12 grid-rows-6 gap-2 flex-grow min-h-0">
        <div className="col-span-3 row-span-3">
          <Box1 />
        </div>
        
        <div className="col-span-6 row-span-4">
          <Box4 />
        </div>

        <div className="col-span-3 row-span-2">
          <Box6 />
        </div>

        <div className="col-span-3 row-span-2">
          <Box7 />
        </div>

        <div className="col-span-3 row-span-1">
          <Box2 />
        </div>

        <div className="col-span-3 row-span-2">
          <Box3 />
        </div>

        <div className="col-span-6 row-span-2">
          <Box5 />
        </div>

        <div className="col-span-3 row-span-3">
          <Box8 />
        </div>
      </div>

      {children}
    </div>
  )
}

export default Layout