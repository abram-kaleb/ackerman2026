import React from 'react'

interface SimulatorControlPanelProps {
  engineSpeed: number;
  setEngineSpeed: (val: number) => void;
  brakingPower: number;
  setBrakingPower: (val: number) => void;
  minSpeedSlider: number;
  maxSpeedSlider: number;
}

export const SimulatorControlPanel: React.FC<SimulatorControlPanelProps> = ({
  engineSpeed,
  setEngineSpeed,
  brakingPower,
  setBrakingPower,
  minSpeedSlider,
  maxSpeedSlider,
}) => {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-00 uppercase tracking-wider">
        Input Parameters
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Engine Speed Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Engine Speed</span>
            <div className="flex items-center gap-1 font-mono">
              <input
                type="number"
                value={engineSpeed}
                onChange={(e) => setEngineSpeed(Number(e.target.value))}
                className="w-16 bg-[#262626] rounded px-1.5 py-0.5 text-right text-slate-100 font-bold focus:outline-none focus:bg-[#333333]"
              />
              <span className="text-[10px] text-slate-400">RPM</span>
            </div>
          </div>
          <input
            type="range"
            min={minSpeedSlider}
            max={maxSpeedSlider}
            step={1}
            value={Math.min(maxSpeedSlider, Math.max(minSpeedSlider, engineSpeed))}
            onChange={(e) => setEngineSpeed(Number(e.target.value))}
            className="w-full h-1 bg-slate-300 rounded appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>{minSpeedSlider} RPM</span>
            <span>{maxSpeedSlider} RPM</span>
          </div>
        </div>

        {/* Braking Power Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Braking Power / Load</span>
            <div className="flex items-center gap-1 font-mono">
              <input
                type="number"
                value={brakingPower}
                onChange={(e) => setBrakingPower(Number(e.target.value))}
                className="w-16 bg-[#262626] rounded px-1.5 py-0.5 text-right text-slate-100 font-bold focus:outline-none focus:bg-[#333333]"
              />
              <span className="text-[10px] text-slate-400">kW</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={980}
            step={1}
            value={Math.min(980, Math.max(0, brakingPower))}
            onChange={(e) => setBrakingPower(Number(e.target.value))}
            className="w-full h-1 bg-slate-300 rounded appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>0 kW</span>
            <span>980 kW</span>
          </div>
        </div>
      </div>
    </div>
  )
}