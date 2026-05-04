// Box3.tsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import GaugeComponent from 'react-gauge-component';
import engineSchema from '../assets/data.json';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

interface GaugeProps {
value: any;
min: number;
max: number;
unit: string;
label: string;
no: number;
onClick: () => void;
}

const CircularGauge = ({ value, min, max, unit, label, no, onClick }: GaugeProps) => {
const numericValue = typeof value === 'number' ? value : 0;

return (
<button
onClick={onClick}
className="flex flex-col items-center justify-center py-2 rounded-xl shadow-2xl hover:bg-white/5 transition-colors w-full relative group"
>
<div className="absolute top-0 right-2 text-[10px] text-white/30 font-mono">#{no}</div>
<h3 className="text-[10px] font-bold text-white uppercase mb-2 tracking-widest opacity-80 group-hover:opacity-100">{label}</h3>

  <div className="relative w-full h-36">
    <GaugeComponent
      type="radial"
      arc={{
        width: 0.15,
        padding: 0.02,
        cornerRadius: 1,
        subArcs: [
          { limit: max * 0.9, color: '#818181', showTick: false },
          { limit: max * 0.95, color: '#eab308', showTick: false },
          { color: '#ef4444', showTick: false }
        ]
      }}
      pointer={{
        color: '#94a3b8',
        length: 0.75,
        width: 8,
        type: 'needle'
      }}
      labels={{
        valueLabel: { hide: true },
        tickLabels: {
          type: 'outer',
          defaultTickValueConfig: {
            formatTextValue: (val) => val.toString(),
            style: { fontSize: '8px', fill: '#9ca3af' }
          }
        }
      }}
      value={numericValue}
      minValue={min}
      maxValue={max}
    />
    
    <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-10">
      <span className="text-[20px] font-black text-white leading-none">
        {numericValue}
      </span>
      <span className="text-[12px] font-bold text-white/50 mt-1 uppercase">
        {unit}
      </span>
    </div>
  </div>
</button>
);
};

const Box3 = () => {
const [latestData, setLatestData] = useState<any>(null);
const [selectedIds, setSelectedIds] = useState<number[]>([8, 9, 10, 11, 12, 13]);
const [editingIndex, setEditingIndex] = useState<number | null>(null);

useEffect(() => {
socket.on('monitoringUpdate', (data) => {
if (data && data.length > 0) {
setLatestData(data[data.length - 1]);
}
});

return () => {
  socket.off('monitoringUpdate');
};
}, []);

const handleParameterChange = (newId: number) => {
if (editingIndex !== null) {
const newIds = [...selectedIds];
newIds[editingIndex] = newId;
setSelectedIds(newIds);
setEditingIndex(null);
}
};

return (
      <div className="bg-[#212121] p-4 h-full overflow-hidden rounded-2xl relative">
      <div className="flex justify-between items-center mb-6">
      <h1 className="text-white text-center bg-black px-3 py-1.5 text-sm font-bold uppercase">
      Engine Telemetry
      </h1>
      {editingIndex !== null && (
      <button
      onClick={() => setEditingIndex(null)}
      className="text-[10px] text-red-400 font-bold uppercase"
      >
      Cancel Selection
      </button>
)}
</div>

  <div className="grid grid-cols-2 gap-4 h-[calc(100%-40px)] overflow-y-auto pr-2">
    {selectedIds.map((id, index) => {
      const item = engineSchema.find((s) => s.No === id);
      if (!item) return null;

      return (
        <CircularGauge
          key={`${index}-${id}`}
          no={item.No}
          label={item.Parameter}
          value={latestData ? latestData[item.No.toString()] : 0}
          min={item.Min}
          max={item.Max}
          unit={item.Unit}
          onClick={() => setEditingIndex(index)}
        />
      );
    })}
  </div>

  {editingIndex !== null && (
    <div className="absolute inset-0 bg-black/90 z-50 p-6 overflow-y-auto backdrop-blur-sm">
      <h2 className="text-white text-center font-bold mb-4 uppercase text-sm">Select Parameter for Slot {editingIndex + 1}</h2>
      <div className="grid grid-cols-1 gap-2">
        {engineSchema.map((param) => (
          <button
            key={param.No}
            onClick={() => handleParameterChange(param.No)}
            className={`text-left p-3 rounded-lg border transition-all ${
              selectedIds.includes(param.No) 
              ? 'border-white/10 text-white/20' 
              : 'border-white/20 text-white hover:bg-white/10'
            }`}
          >
            <span className="font-mono text-xs mr-3">#{param.No}</span>
            <span className="font-bold text-sm">{param.Parameter}</span>
          </button>
        ))}
      </div>
    </div>
  )}
</div>
);
};

export default Box3;