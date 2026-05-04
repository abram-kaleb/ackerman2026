import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import engineSchema from '../assets/data.json';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const Gauge = ({ value, min, max, unit, label }: { value: any; min: number; max: number; unit: string; label: string }) => {
  const isBinary = max <= 1 && max !== min;
  const isStringData = typeof value === 'string';
  const safeMax = max || 100;
  
  const numericValue = typeof value === 'number' ? value : 0;
  const percentage = Math.min(Math.max(((numericValue - min) / (safeMax - min)) * 100, 0), 100);
  
  const isWarning = !isBinary && !isStringData && numericValue >= 0.9 * max && numericValue < max && max > 0;
  const isCritical = !isBinary && !isStringData && numericValue >= max && max > 0;

  const getStatusClass = () => {
    if (isCritical) return 'bg-red-600 text-white';
    if (isWarning) return 'bg-orange-500 text-white';
    return 'bg-slate-100 text-slate-900';
  };

  const getBarClass = () => {
    if (isCritical || isWarning) return 'bg-white';
    return 'bg-black';
  };

  return (
    <div className={`p-3 border-b border-r border-black flex flex-col justify-between transition-colors duration-300 ${getStatusClass()}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[12px] font-black uppercase leading-tight truncate w-3/4">{label}</span>
        <span className="text-[12px] font-mono opacity-50">{unit}</span>
      </div>

      {isStringData ? (
        <div className="flex items-center h-8">
          <span className="text-sm font-mono font-black">{value}</span>
        </div>
      ) : !isBinary ? (
        <div className="relative h-8 w-full bg-gray-200 border border-black overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-[10%] bg-orange-300 opacity-30 border-l border-orange-400" />
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${getBarClass()}`}
            style={{ width: `${percentage}%` }} 
          />
          <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
             <span className="text-xs font-mono font-black text-white">
                {numericValue.toFixed(1)}
             </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 border border-black ${numericValue > 0 ? (isWarning || isCritical ? 'bg-white' : 'bg-black') : 'bg-transparent'}`} />
          <span className="text-xs font-black font-mono">{numericValue > 0 ? 'ON' : 'OFF'}</span>
        </div>
      )}
      
      <div className="flex justify-between mt-1 text-[7px] font-mono opacity-40">
        <span>{!isStringData ? min : '-'}</span>
        <span>{!isStringData ? max : '-'}</span>
      </div>
    </div>
  );
};

const Data = () => {
  const [latestData, setLatestData] = useState<any>(null);

  useEffect(() => {
    socket.on('monitoringUpdate', (data) => {
      if (data && data.length > 0) {
        setLatestData(data[data.length - 1]);
      }
    });
    return () => { socket.off('monitoringUpdate'); };
  }, []);

  const alertItems = useMemo(() => {
    if (!latestData) return [];
    return engineSchema
      .filter((item) => {
        const val = latestData[item.No.toString()];
        const numericVal = typeof val === 'number' ? val : 0;
        return item.Max > 0 && numericVal >= 0.9 * item.Max;
      })
      .sort((a, b) => {
        const valA = latestData[a.No.toString()];
        const valB = latestData[b.No.toString()];
        const isCritA = valA >= a.Max ? 1 : 0;
        const isCritB = valB >= b.Max ? 1 : 0;
        return isCritB - isCritA;
      })
      .map((item) => ({
        ...item,
        currentValue: latestData[item.No.toString()]
      }));
  }, [latestData]);

  const renderSection = (title: string, startId: number, endId: number) => {
    const items = engineSchema.filter((i) => i.No >= startId && i.No <= endId);
    return (
      <div className="flex flex-col border-t border-l border-black">
        <div className="bg-black text-white p-1.5">
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-center">{title}</h2>
        </div>
        <div className="grid grid-cols-2">
          {items.map((item) => (
            <Gauge 
              key={item.No}
              label={item.Parameter}
              value={latestData ? latestData[item.No.toString()] : (item.Max === 0 ? '--' : 0)}
              min={item.Min}
              max={item.Max}
              unit={item.Unit}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-900 text-white font-sans min-h-screen">
      <header className="border-b-4 border-white mb-6 flex justify-between items-end pb-2">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Telemetry Gauge</h1>
          <p className="text-[10px] text-white font-bold uppercase mt-1">MAN 6L2330 Monitoring v1.0</p>
        </div>
        <div className="text-right">
          <div className={`text-xs font-black px-3 py-1 border-2 border-black mb-1 ${latestData ? 'bg-emerald-900' : 'bg-red-500 text-white animate-pulse'}`}>
            {latestData ? 'DATA STREAM ACTIVE' : 'NO TELEMETRY'}
          </div>
          <span className="text-[9px] font-mono">LINK: localhost</span>
        </div>
      </header>

      {!latestData ? (
        <div className="py-40 text-center font-black tracking-[0.5em] animate-pulse">AWAITING BUS SIGNAL...</div>
      ) : (
        <>
          {alertItems.length > 0 && (
            <div className="mb-8">
              <div className="bg-black text-white p-2 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest">Priority Dashboard (Warning/Critical)</h2>
                <div className="flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500"></span> WARNING</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-600"></span> CRITICAL</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-l border-t border-black">
                {alertItems.map((item) => (
                  <Gauge 
                    key={`alert-${item.No}`}
                    label={item.Parameter}
                    value={item.currentValue}
                    min={item.Min}
                    max={item.Max}
                    unit={item.Unit}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderSection("Engine/Brake", 1, 21)}
            {renderSection("Exhaust System", 22, 55)}
            {renderSection("HT Cooling Water", 56, 71)}
            {renderSection("LT Cooling Water", 72, 86)}
            {renderSection("Lube Oil", 87, 99)}
            {renderSection("Charge Air", 100, 106)}
            {renderSection("Fuel Oil", 107, 156)}
            {renderSection("Starting Air", 157, 159)}
            {renderSection("Nozzle Cooling", 160, 167)}
          </div>
        </>
      )}
    </div>
  );
};

export default Data;