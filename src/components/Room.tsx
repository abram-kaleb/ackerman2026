// Box2.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { io } from 'socket.io-client'
import engineSchema from '../assets/data.json'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const Box2 = () => {
  const [latestData, setLatestData] = useState<any>(null)
  
  const selectedIdsLeft = useMemo(() => [17, 18, 19], [])
  const selectedIdsRight = useMemo(() => [1, 2], [])

  const indicatorsLeft = useMemo(() => 
    engineSchema.filter((item) => selectedIdsLeft.includes(item.No)), 
    [selectedIdsLeft]
  )

  const indicatorsRight = useMemo(() => 
    engineSchema.filter((item) => selectedIdsRight.includes(item.No)), 
    [selectedIdsRight]
  )

  useEffect(() => {
    const handleUpdate = (data: any) => {
      if (data && data.length > 0) {
        setLatestData(data[data.length - 1])
      }
    }
    socket.on('monitoringUpdate', handleUpdate)
    return () => {
      socket.off('monitoringUpdate', handleUpdate)
    }
  }, [])

  return (
    <div className="relative w-full h-full min-w-0 min-h-0 bg-[#212121] overflow-hidden group rounded-2xl p-6">
      <div className="absolute top-4 left-6 z-10 pointer-events-none">
        <h1 className="text-white text-center bg-black px-3 py-1.5 text-sm font-bold uppercase">
          MAN 6L 2330 Data Monitor
        </h1>
        
        <div className="mt-4 flex flex-col gap-3">
          {indicatorsLeft.map((item) => {
            const value = latestData ? latestData[item.No.toString()] : null
            const isCritical = value !== null && typeof value === 'number' && (value >= item.Max || value <= item.Min) && item.Max !== 0

            return (
              <div key={item.No} className="p-3 rounded-lg min-w-[160px]">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
                  {item.Parameter}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-mono font-black ${isCritical ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {typeof value === 'number' ? value.toFixed(1) : '--'}
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase">{item.Unit}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!latestData && (
        <div className="absolute bottom-6 left-6 z-10">
          <span className="text-[9px] font-bold text-red-700 animate-pulse tracking-[0.2em]">SYSTEM OFFLINE</span>
        </div>
      )}

      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
        {indicatorsRight.map((item) => {
          const value = latestData ? latestData[item.No.toString()] : null
          
          return (
            <div key={item.No} className="p-3 border-r-2 border-white/10 text-right min-w-[120px]">
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">
                {item.Parameter}
              </div>
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-2xl font-mono font-light text-white">
                  {typeof value === 'number' ? value.toFixed(0) : '--'}
                </span>
                <span className="text-[8px] text-gray-600 font-bold uppercase">{item.Unit}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Box2