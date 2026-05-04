// Box6.tsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import engineSchema from '../assets/data.json';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

interface Alarm {
  id: number;
  label: string;
  type: 'WARNING' | 'CRITICAL';
  status: string;
  timestamp: string;
  value: number;
  limit: number;
}

const Box6 = () => {
  const [activeAlarms, setActiveAlarms] = useState<Alarm[]>([]);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    socket.on('monitoringUpdate', (data) => {
      const now = Date.now();

      if (now - lastScanTime >= 10000) {
        setLastScanTime(now);

        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          const currentTimeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });

          const newAlarms = engineSchema
            .filter((param) => {
              if (param.Min === 0 && param.Max === 1) return false;
              const value = latest[param.No.toString()];
              const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              if (numericValue === 0) return false;
              return numericValue >= param.Max || numericValue <= param.Min;
            })
            .map((param) => {
              const value = latest[param.No.toString()];
              const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              const isOver = numericValue >= param.Max;

              return {
                id: param.No,
                label: param.Parameter,
                type: (isOver ? 'CRITICAL' : 'WARNING') as 'CRITICAL' | 'WARNING',
                status: isOver ? 'OVER LIMIT' : 'UNDER LIMIT',
                timestamp: currentTimeStr,
                value: numericValue,
                limit: isOver ? param.Max : param.Min
              };
            });

          setActiveAlarms((prev) => {
            const merged = [...prev];
            newAlarms.forEach(newAlarm => {
              if (!merged.find(a => a.id === newAlarm.id)) {
                merged.push(newAlarm);
              }
            });
            return merged;
          });
        }
      }
    });

    return () => {
      socket.off('monitoringUpdate');
    };
  }, [lastScanTime]);

  const handleAcknowledge = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveAlarms(prev => prev.filter(alarm => alarm.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-[#212121] p-4 flex flex-col h-full font-sans text-white rounded-xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
           <h1 className="text-white text-center bg-black px-3 py-1.5 text-sm font-bold uppercase">
            Alarms
          </h1>
          <span className="text-red-500 text-[10px] font-bold">
            {activeAlarms.length} ACTIVE
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto pr-1 custom-scrollbar">
        {activeAlarms.length > 0 ? (
          activeAlarms.map((alarm) => (
            <div
              key={alarm.id}
              onClick={() => toggleExpand(alarm.id)}
              className={`cursor-pointer transition-all duration-200 border-l-2 bg-white/5 hover:bg-white/10 ${
                alarm.type === 'CRITICAL' ? 'border-red-600' : 'border-yellow-500'
              } ${expandedId === alarm.id ? 'mb-2' : 'mb-0'}`}
            >
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] opacity-70 font-mono w-6">#{alarm.id}</span>
                  <span className={`text-[12px] font-bold uppercase tracking-tight ${
                    expandedId === alarm.id ? 'text-white' : 'text-white/70'
                  }`}>
                    {alarm.label}
                  </span>
                </div>
                {expandedId !== alarm.id && (
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    alarm.type === 'CRITICAL' ? 'bg-red-600' : 'bg-yellow-500'
                  }`} />
                )}
              </div>

              {expandedId === alarm.id && (
                <div className="px-2 pb-2 pt-1 border-t border-white/5 mx-2 mt-1">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase opacity-40">Status</span>
                      <span className={`text-[10px] font-black ${
                        alarm.type === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'
                      }`}>{alarm.status}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] uppercase opacity-40">Detected</span>
                      <span className="text-[10px] font-mono">{alarm.timestamp}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase opacity-40">Current Value</span>
                      <span className="text-[10px] font-bold">{alarm.value}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] uppercase opacity-40">Limit Threshold</span>
                      <span className="text-[10px] font-bold">{alarm.limit}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleAcknowledge(e, alarm.id)}
                    className="w-full py-1.5 bg-white/10 hover:bg-red-600 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest rounded-sm"
                  >
                    Acknowledge Fault
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-20 italic">
            <span className="text-[10px] tracking-widest uppercase font-light">Monitoring Active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Box6;