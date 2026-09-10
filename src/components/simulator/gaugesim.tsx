import React from 'react'
import GaugeComponent from 'react-gauge-component'

interface SimulatorGaugeProps {
  label: string;
  value: number;
  r2Score: number;
  modelKey: string;
  minConfig?: number;
  maxConfig?: number;
  unitConfig?: string;
}

export const CircularGaugeCard = ({
  label,
  value,
  r2Score,
  modelKey,
  minConfig,
  maxConfig,
  unitConfig
}: SimulatorGaugeProps) => {
  const numericValue = typeof value === 'number' && !isNaN(value) ? Number(value.toFixed(2)) : 0;

  const hasValidConfig = minConfig !== undefined && maxConfig !== undefined && (minConfig !== 0 || maxConfig !== 0);

  const safeMin = hasValidConfig ? minConfig! : (numericValue < 0 ? Math.floor(numericValue * 1.5) : 0);
  const safeMax = hasValidConfig ? maxConfig! : Math.max(10, Math.ceil(Math.abs(numericValue) * 1.25));

  const displayUnit = unitConfig && unitConfig !== 'null' && unitConfig !== '-' ? unitConfig : '';

  return (
    <div className="flex flex-col items-center justify-between p-3.5 rounded-lg bg-slate-900 shadow-md relative">
      
      {/* Header Badge & R2 Score */}
      <div className="w-full flex justify-between items-center mb-1 font-mono">
        <span className="text-[10px] text-slate-400">
          R² {r2Score?.toFixed(3) ?? 'N/A'}
        </span>
      </div>

      {/* Label Title */}
      <h3 className="text-[11px] font-semibold text-slate-200 uppercase mb-1 tracking-wide text-center line-clamp-2 h-7 leading-tight">
        {label}
      </h3>

      {/* Gauge Canvas Container */}
      <div className="relative w-full h-36">
        <GaugeComponent
          type="radial"
          arc={{
            width: 0.12,
            padding: 0.02,
            cornerRadius: 0,
            subArcs: [
              { limit: safeMin + (safeMax - safeMin) * 0.70, color: '#69cdff', showTick: false }, // Digital Sky Blue (Normal)
              { limit: safeMin + (safeMax - safeMin) * 0.88, color: '#f8bb38', showTick: false }, // Cyan Accent (Warning/High)
              { color: '#f43f5e', showTick: false }                                             // Soft Red (Critical)
            ]
          }}
          pointer={{
            color: '#38bdf8',
            length: 0.75,
            width: 8,
            type: 'needle'
          }}
          labels={{
            valueLabel: { hide: true },
            tickLabels: {
              type: 'outer',
              defaultTickValueConfig: {
                formatTextValue: (val) => Math.round(val).toString(),
                style: { fontSize: '9px', fill: '#64748b', fontWeight: '500' }
              }
            }
          }}
          value={numericValue}
          minValue={safeMin}
          maxValue={safeMax}
        />

        {/* Center Digital Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-7">
          <span className="text-[18px] font-bold text-sky-300 leading-none font-mono tracking-tight">
            {numericValue}
          </span>
          {displayUnit && (
            <span className="text-[10px] font-medium text-sky-500/80 font-mono mt-0.5">
              {displayUnit}
            </span>
          )}
        </div>
      </div>

      {/* Footer Min/Max */}
      <div className="w-full pt-2 flex justify-between text-[10px] font-mono text-slate-400">
        <span>MIN: {safeMin}</span>
        <span>MAX: {safeMax}</span>
      </div>
    </div>
  );
};