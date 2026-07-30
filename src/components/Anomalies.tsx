import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip } from 'recharts';

import featureData from '../assets/feature2.json';

// --- CONFIG & CONSTANTS ---
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const MAX_OEM_HOURS = 32000;
const CURRENT_HOURS = 120;
const NORMAL_THRESHOLD = 0.2;
const MIN_THRESHOLD = -0.5;
const ANOMALY_THRESHOLD = 85.0; // Health index threshold (%)
const SMOOTHING_WINDOW = 10;
const CONSECUTIVE_LOGS = 10;

// --- TYPES & INTERFACES ---
interface FeatureItem {
  no: number;
  name: string;
  sql: number | string;
}

interface TrendLog {
  id: number;
  overall: number;
  time?: string;
}

interface ProcessedLog extends TrendLog {
  raw_health: number;
  health_index: number;
}

interface DashboardPayload {
  trend: TrendLog[];
}

interface RULResult {
  hasAnomaly: boolean;
  anomalyLogId: number | null;
  anomalyTimestamp: string | null;
  degradationRatePer1k: number;
  finalRulHours: number;
  baseRulHours: number;
}

// --- HELPER MAPPING ---
const featureMap: Record<string, FeatureItem> = {};
(featureData as FeatureItem[]).forEach((item) => {
  featureMap[String(item.sql)] = item;
});

// --- NATIVE CALCULATION LOGIC ---
const calculateSensitiveHealth = (overall: number): number => {
  if (overall === undefined || overall === null || isNaN(overall)) return 100.0;
  const health = ((overall - MIN_THRESHOLD) / (NORMAL_THRESHOLD - MIN_THRESHOLD)) * 100.0;
  return Math.min(Math.max(health, 0.0), 100.0);
};

const processBatchHealth = (logs: TrendLog[]): ProcessedLog[] => {
  const processed: ProcessedLog[] = logs.map((log) => ({
    ...log,
    raw_health: calculateSensitiveHealth(log.overall),
    health_index: 0,
  }));

  for (let i = 0; i < processed.length; i++) {
    const start = Math.max(0, i - SMOOTHING_WINDOW + 1);
    const window = processed.slice(start, i + 1);
    const sum = window.reduce((acc, curr) => acc + curr.raw_health, 0);
    processed[i].health_index = sum / window.length;
  }

  return processed;
};

const calculateRUL = (processedLogs: ProcessedLog[]): RULResult => {
  const baseRulHours = MAX_OEM_HOURS - CURRENT_HOURS;

  if (!processedLogs.length) {
    return {
      hasAnomaly: false,
      anomalyLogId: null,
      anomalyTimestamp: null,
      degradationRatePer1k: 0,
      finalRulHours: baseRulHours,
      baseRulHours,
    };
  }

  let firstAnomalyIndex = -1;
  let consecutiveCount = 0;

  for (let i = 0; i < processedLogs.length; i++) {
    if (processedLogs[i].health_index < ANOMALY_THRESHOLD) {
      consecutiveCount++;
      if (consecutiveCount === CONSECUTIVE_LOGS) {
        firstAnomalyIndex = i - CONSECUTIVE_LOGS + 1;
        break;
      }
    } else {
      consecutiveCount = 0;
    }
  }

  if (firstAnomalyIndex === -1) {
    return {
      hasAnomaly: false,
      anomalyLogId: null,
      anomalyTimestamp: null,
      degradationRatePer1k: 0,
      finalRulHours: baseRulHours,
      baseRulHours,
    };
  }

  const degradingLogs = processedLogs.slice(firstAnomalyIndex);
  const n = degradingLogs.length;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = degradingLogs[i].health_index;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
  const currentHealth = processedLogs[processedLogs.length - 1].health_index;

  let finalRulHours = baseRulHours;
  if (slope < 0 || currentHealth < 100.0) {
    const healthPenaltyRatio = Math.pow(Math.max(0.0, currentHealth / 100.0), 1.5);
    finalRulHours = baseRulHours * healthPenaltyRatio;
  }

  const firstAnomalyRow = processedLogs[firstAnomalyIndex];

  return {
    hasAnomaly: true,
    anomalyLogId: firstAnomalyRow.id,
    anomalyTimestamp: firstAnomalyRow.time || 'N/A',
    degradationRatePer1k: slope * 1000,
    finalRulHours,
    baseRulHours,
  };
};

// --- MAIN COMPONENT ---
const AnomalyMonitoringSection = () => {
  const [data, setData] = useState<DashboardPayload>({ trend: [] });

// --- GANTI EFFECT DENGAN DUMMY LOCAL INI TUK SEMENTARA ---
useEffect(() => {
  // Membuat 150 data log dummy yang mencerminkan pola grafik pada gambar image_ad3cad.png
  const totalLogs = 150;
  const dummyTrend: TrendLog[] = [];

  for (let i = 1; i <= totalLogs; i++) {
    let overallVal = -0.001; // Nilai baseline untuk menghasilkan Health Index ~71.4%

    // Simulasi lekukan/pola naik-turun grafik seperti di gambar image_ad3cad.png
    if (i >= 15 && i <= 55) {
      // Penurunan grafik pertama (Health index berkisar ~60% - 63%)
      const noise = (Math.random() * 0.01) - 0.005;
      overallVal = -0.06 + noise;
    } else if (i >= 70 && i <= 95) {
      // Grafik kembali naik mendatar (Health index ~71.4%)
      overallVal = -0.001;
    } else if (i >= 100 && i <= 135) {
      // Penurunan grafik kedua (Health index ~60%)
      const noise = (Math.random() * 0.01) - 0.005;
      overallVal = -0.065 + noise;
    } else if (i > 135) {
      // Naik kembali di bagian paling kanan grafik
      overallVal = -0.001;
    }

    dummyTrend.push({
      id: i,
      // Overall score diset mendekati 0.0000 agar status tetap NORMAL seperti di gambar
      overall: parseFloat(overallVal.toFixed(4)),
      time: new Date(Date.now() - (totalLogs - i) * 60000).toLocaleTimeString('en-GB')
    });
  }

  // Set data ke state
  setData({ trend: dummyTrend });

  // Event listener Socket jika nantinya backend terhubung
  socket.on('anomalyDashboardUpdate', (payload: DashboardPayload) => {
    if (payload && payload.trend && payload.trend.length > 0) {
      setData(payload);
    }
  });

  return () => {
    socket.off('anomalyDashboardUpdate');
  };
}, []);
  const processedTrend = useMemo(() => processBatchHealth(data.trend), [data.trend]);
  const rulMetrics = useMemo(() => calculateRUL(processedTrend), [processedTrend]);

  const latestScore = data.trend.length ? data.trend[data.trend.length - 1].overall : 0;
  const latestHealth = processedTrend.length ? processedTrend[processedTrend.length - 1].health_index : 100;
  const isAnomaly = latestScore < 0;

  return (
    <div className="bg-[#212121] p-4 flex flex-col h-full font-sans text-white rounded-xl">
      {/* HEADER SECTION - Match Box6 Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-white text-center bg-black px-3 py-1.5 text-sm font-bold uppercase">
            Engine Status
          </h1>
          <span className={`text-[10px] font-bold ${isAnomaly ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
            {isAnomaly ? 'ANOMALY DETECTED' : 'NORMAL OPERATION'}
          </span>
        </div>
        <span className="text-[10px] font-mono opacity-40">
          SCORE: {latestScore.toFixed(4)}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
        {/* KPI METRICS PANEL - Re-styled with Box6 aesthetics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Health Index */}
          <div className="bg-white/5 border-l-2 border-blue-500 p-2 flex flex-col justify-between">
            <span className="text-[8px] uppercase opacity-40 font-bold">Health Index</span>
            <span className="text-sm font-black text-white">{latestHealth.toFixed(1)}%</span>
            <span className="text-[8px] opacity-40">Sensitised Scale</span>
          </div>

          {/* RUL */}
          <div className="bg-white/5 border-l-2 border-emerald-500 p-2 flex flex-col justify-between">
            <span className="text-[8px] uppercase opacity-40 font-bold">Hybrid RUL</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {Math.round(rulMetrics.finalRulHours).toLocaleString()} <span className="text-[10px] font-normal text-white">HRS</span>
            </span>
            <span className="text-[8px] opacity-40">Base: {rulMetrics.baseRulHours.toLocaleString()} HRS</span>
          </div>

          {/* Anomaly Status */}
          <div className={`bg-white/5 border-l-2 p-2 flex flex-col justify-between ${
            rulMetrics.hasAnomaly ? 'border-red-600' : 'border-white/20'
          }`}>
            <span className="text-[8px] uppercase opacity-40 font-bold">First Anomaly</span>
            <span className={`text-sm font-black ${rulMetrics.hasAnomaly ? 'text-red-500' : 'text-white/70'}`}>
              {rulMetrics.hasAnomaly ? `#${rulMetrics.anomalyLogId}` : 'None'}
            </span>
            <span className="text-[8px] opacity-40">
              {rulMetrics.hasAnomaly ? 'Persistent Degradation' : 'Healthy Condition'}
            </span>
          </div>

          {/* Degradation Rate */}
          <div className={`bg-white/5 border-l-2 p-2 flex flex-col justify-between ${
            rulMetrics.degradationRatePer1k < 0 ? 'border-yellow-500' : 'border-emerald-500'
          }`}>
            <span className="text-[8px] uppercase opacity-40 font-bold">Degradation Rate</span>
            <span className={`text-sm font-black font-mono ${
              rulMetrics.degradationRatePer1k < 0 ? 'text-yellow-500' : 'text-emerald-400'
            }`}>
              {rulMetrics.degradationRatePer1k.toFixed(2)}%
            </span>
            <span className="text-[8px] opacity-40">per 1k logs</span>
          </div>
        </div>

        {/* GRAPH SECTION */}
        <div className="bg-white/5 p-3 rounded-sm border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              Health Trend Monitoring
            </span>
            <div className="flex gap-3 text-[9px] font-mono">
              <span className="flex items-center gap-1 opacity-70">
                <span className="w-2 h-0.5 bg-blue-500"></span> Smoothed
              </span>
              <span className="flex items-center gap-1 opacity-40">
                <span className="w-2 h-0.5 bg-red-500"></span> Raw
              </span>
            </div>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="id" hide />
                <YAxis 
                  stroke="#ffffff" 
                  opacity={0.3} 
                  fontSize={8} 
                  tickLine={false} 
                  domain={[0, 100]} 
                  tickCount={5}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#181818', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    fontSize: '10px',
                    borderRadius: '2px',
                    color: '#fff'
                  }}
                  itemStyle={{ padding: 0 }}
                  labelStyle={{ color: '#888', marginBottom: '2px' }}
                />

                {/* Warning Threshold */}
                <ReferenceLine
                  y={ANOMALY_THRESHOLD}
                  stroke="#eab308"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  opacity={0.6}
                  label={{
                    value: `LIMIT ${ANOMALY_THRESHOLD}%`,
                    fill: '#eab308',
                    fontSize: 7,
                    position: 'top',
                    opacity: 0.8
                  }}
                />

                {/* Vertical Anomaly Point Line */}
                {rulMetrics.hasAnomaly && (
                  <ReferenceLine
                    x={rulMetrics.anomalyLogId!}
                    stroke="#dc2626"
                    strokeWidth={1.5}
                    label={{
                      value: 'ANOMALY DETECTED',
                      fill: '#dc2626',
                      fontSize: 7,
                      position: 'insideTopLeft',
                      fontWeight: 'bold'
                    }}
                  />
                )}

                {/* Raw Line */}
                <Line
                  type="monotone"
                  dataKey="raw_health"
                  stroke="#ef4444"
                  strokeWidth={1}
                  dot={false}
                  opacity={0.25}
                  name="Raw"
                  isAnimationActive={false}
                />

                {/* Smoothed Line */}
                <Line
                  type="monotone"
                  dataKey="health_index"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  name="Health Index"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyMonitoringSection;