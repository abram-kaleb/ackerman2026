// Box5.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import engineSchema from '../assets/data.json';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const CustomTooltip = React.memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black p-1.5 px-3 rounded-md shadow-lg border border-[#333] text-center">
        <p className="text-[10px] font-semibold text-white">{payload[0].payload.time}</p>
        <p className="text-[10px] text-blue-400">{payload[0].value}</p>
      </div>
    );
  }
  return null;
});

const ActiveDot = (props: any) => {
  const { cx, cy, index, dataLength } = props;
  if (index === dataLength - 1) {
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={2.5} 
        stroke="none" 
        fill="#3b82f6" 
        className="drop-shadow-[0_0_3px_#3b82f6]" 
      />
    );
  }
  return null;
};

const ChartInstance = React.memo(({ selectedId, dataHistory, onIdChange }: { selectedId: number, dataHistory: any[], onIdChange: (id: number) => void }) => {
  const config = useMemo(() => engineSchema.find((item) => item.No === selectedId), [selectedId]);
  
  const chartData = useMemo(() => dataHistory.map(d => ({ 
    time: d.time, 
    value: d.values && d.values[selectedId] !== undefined ? d.values[selectedId] : 0,
  })), [dataHistory, selectedId]);

  const yDomain = useMemo(() => [
    config?.Min ?? 'auto',
    config?.Max ?? 'auto'
  ], [config]);

  const formatYAxis = useCallback((value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value;
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <select 
          value={selectedId} 
          onChange={(e) => onIdChange(Number(e.target.value))}
          className="bg-transparent text-white text-[12px] font-medium border-none outline-none cursor-pointer p-0"
        >
          {engineSchema.map((item) => (
            <option key={item.No} value={item.No} className="bg-[#1a1a1a]">
              {item.Parameter} ({item.Unit})
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 w-full min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="#2d3748" strokeOpacity={0.1} vertical horizontal />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              stroke="#646464" 
              fontSize={10} 
              tickMargin={5}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={yDomain} 
              tickFormatter={formatYAxis}
              tickLine={false} 
              axisLine={false} 
              stroke="#ffffff" 
              fontSize={10} 
              tickMargin={3}
              width={40}
              allowDecimals
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              activeDot={<ActiveDot dataLength={chartData.length} />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const Box5 = () => {
  const [dataHistory, setDataHistory] = useState<any[]>([]);
  const [leftId, setLeftId] = useState(8);
  const [rightId, setRightId] = useState(9);
  
  const bufferRef = useRef<any>(null);

  useEffect(() => {
    const handleSocket = (newData: any[]) => {
      if (newData && newData.length > 0) {
        bufferRef.current = newData[newData.length - 1];
      }
    };

    socket.on('monitoringUpdate', handleSocket);

    const interval = setInterval(() => {
      if (bufferRef.current) {
        const timeStr = new Date().toLocaleTimeString([], { 
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        });

        setDataHistory((prev) => {
          const updated = [...prev, { time: timeStr, values: bufferRef.current }];
          bufferRef.current = null; 
          return updated.slice(-30);
        });
      }
    }, 1000);

    return () => {
      socket.off('monitoringUpdate', handleSocket);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative bg-[#212121] rounded-2xl pt-14 pb-3 px-4 h-full flex flex-row gap-4 font-sans select-none overflow-hidden">
      <div className="absolute top-4 left-6 z-10">
         <h1 className="text-white text-center bg-black px-3 py-1.5 text-sm font-bold uppercase">
          Trend Chart
        </h1>
      </div>

      <ChartInstance selectedId={leftId} dataHistory={dataHistory} onIdChange={setLeftId} />
      <div className="w-[1px] bg-[#333] h-3/4 self-center opacity-50" />
      <ChartInstance selectedId={rightId} dataHistory={dataHistory} onIdChange={setRightId} />
    </div>
  );
};

export default Box5;