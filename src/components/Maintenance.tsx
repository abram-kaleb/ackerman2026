// Box4.js
import React, { useEffect, useState, useMemo } from 'react'
import { io } from 'socket.io-client'
import overhaulData from '../assets/overhaul.json'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const Box4 = () => {
  const [engineHours, setEngineHours] = useState(0)
  const [currentTimestamp, setCurrentTimestamp] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    socket.on('monitoringUpdate', (data) => {
      if (data && data.length > 0) {
        const latest = data[data.length - 1]
        
        const hours = parseFloat(latest["7"])
        if (!isNaN(hours)) {
          setEngineHours(hours)
        }

        // Format Date: 200504 (YYMMDD)
        // Format Time: 143242 (HHMMSS)
        const rawDate = latest["5"]?.toString()
        const rawTime = latest["6"]?.toString()
        
        if (rawDate && rawTime && rawDate.length === 6 && rawTime.length === 6) {
          try {
            const year = parseInt(rawDate.substring(0, 2)) + 2000
            const month = parseInt(rawDate.substring(2, 4)) - 1
            const day = parseInt(rawDate.substring(4, 6))
            
            const hour = parseInt(rawTime.substring(0, 2))
            const minute = parseInt(rawTime.substring(2, 4))
            const second = parseInt(rawTime.substring(4, 6))

            const actualDate = new Date(year, month, day, hour, minute, second)
            
            if (!isNaN(actualDate.getTime())) {
              setCurrentTimestamp(actualDate)
            }
          } catch (err) {
            console.error("Parsing error:", err)
          }
        }
      }
    })

    return () => {
      socket.off('monitoringUpdate')
    }
  }, [])

  const processedData = useMemo(() => {
    const baseDate = currentTimestamp || new Date()

    const data = overhaulData.map(item => {
      const maxHours = item["Maximum Hours"]
      
      let progress = 0
      let status = "Normal"
      let hoursLeft = 0
      let estimationDate = null

      if (maxHours > 0) {
        const currentCycleHours = engineHours % maxHours
        hoursLeft = Math.max(0, maxHours - currentCycleHours)
        progress = Math.min(Math.round((currentCycleHours / maxHours) * 100), 100)
        
        estimationDate = new Date(baseDate.getTime() + hoursLeft * 60 * 60 * 1000)

        if (progress >= 95 || hoursLeft <= 50) status = "Urgent"
        else if (progress >= 75 || hoursLeft <= 200) status = "Warning"
      }

      return {
        ...item,
        progress,
        status,
        hoursLeft,
        estimationDate: estimationDate ? estimationDate.toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '-'
      }
    })

    return data.sort((a, b) => {
      if (a["Maximum Hours"] === 0) return 1
      if (b["Maximum Hours"] === 0) return -1
      return a.hoursLeft - b.hoursLeft
    })
  }, [engineHours, currentTimestamp])

  const filteredData = processedData.filter(item => 
    item.Component.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Action.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full h-full max-h-screen overflow-y-auto text-slate-100 p-4 md:p-6 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase">Maintenance Prediction</h1>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-slate-400 text-sm">
              Current Engine Hours: <span className="text-blue-400 font-mono font-bold">{engineHours.toFixed(1)} hrs</span>
            </p>
            <p className="text-slate-500 text-[11px] italic">
              Data Ref: {currentTimestamp ? currentTimestamp.toLocaleString('id-ID') : 'Awaiting Data...'}
            </p>
          </div>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search component..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-none rounded-lg pl-4 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-bold">Component & Action</th>
                <th className="px-6 py-4 font-bold">Details</th>
                <th className="px-6 py-4 font-bold">Progress</th>
                <th className="px-6 py-4 font-bold">Remaining</th>
                <th className="px-6 py-4 font-bold">Est. Schedule</th>
                <th className="px-6 py-4 text-right font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredData.map((item) => (
                <tr key={item.No} className={`hover:bg-slate-800/30 transition-colors ${item.status === 'Urgent' ? 'bg-rose-500/5' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-slate-200">{item.Component}</div>
                    <div className="text-[11px] text-slate-500 italic">{item.Action}</div>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate">
                    {item.Details || "-"}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          item.status === 'Urgent' ? 'bg-rose-500' : 
                          item.status === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{item.progress}%</span>
                  </td>

                  <td className="px-6 py-4">
                    {item["Maximum Hours"] > 0 ? (
                      <div className="flex flex-col">
                        <span className={`text-sm font-mono font-bold ${item.status === 'Urgent' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {Math.floor(item.hoursLeft)}h {Math.round((item.hoursLeft % 1) * 60)}m
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic font-mono">Periodic</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold ${item.status === 'Urgent' ? 'text-rose-300' : 'text-slate-300'}`}>
                      {item.estimationDate}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-black px-2 py-1 rounded border ${
                      item.status === 'Urgent' ? 'text-rose-500 border-rose-500/30 bg-rose-500/10 animate-pulse' : 
                      item.status === 'Warning' ? 'text-amber-500 border-amber-500/30 bg-amber-500/5' : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Box4