import React, { useState } from 'react'
import { CircularGaugeCard } from './components/simulator/gaugesim'
import { SimulatorControlPanel } from './components/simulator/controlsim'
import { 
  masterData, 
  headerMapping, 
  telemetryByIdMap, 
  calculateRawPolynomial 
} from './components/simulator/utilsim'

export default function Simulator() {
  const modelsEntries = Object.entries(masterData.models)
  const firstModel = modelsEntries[0]?.[1]

  const minSpeedSlider = 400
  const maxSpeedSlider = 960

  const defaultSpeed = firstModel?.scaling?.x_mean ?? 500
  const defaultPower = firstModel?.scaling?.y_mean ?? 500

  const [engineSpeed, setEngineSpeed] = useState<number>(defaultSpeed)
  const [brakingPower, setBrakingPower] = useState<number>(defaultPower)

  // =========================================================================
  // SUSUNAN HARDCODE HANYA BERDASARKAN ID DI HEADERDATASIMULATOR.JSON (36 TOTAL)
  // =========================================================================

  // 1. Exhaust Temperature Cylinder 1-6 (Diset 6 Kolom Sebaris)
  const cylinderExhaustIds = [22, 23, 24, 25, 26, 27]

  // 2. HTCW Cylinder 1-6 (Diset 6 Kolom Sebaris)
  const cylinderHtcwIds = [58, 59, 60, 61, 62, 63]

  // 3. Exhaust & Turbocharger System Lainnya
  const exhaustTurboIds = [28, 29, 31, 32]

  // 4. HTCW System Lainnya
  const htcwSystemIds = [57, 64, 65, 66, 67]

  // 5. LTCW System
  const ltcwSystemIds = [72, 73, 74, 75, 76, 78]

  // 6. Lube Oil System
  const lubeOilIds = [88, 89, 90, 93]

  // 7. Charge Air & Fuel System
  const chargeAirFuelIds = [100, 101, 102, 103, 110]

  // Helper Render Single Gauge
  const renderGauge = (id: number) => {
    const entry = Object.entries(headerMapping.model_mappings).find(([_, targetNo]) => targetNo === id)
    const modelName = entry ? entry[0] : null
    const modelData = modelName ? masterData.models[modelName] : null
    const config = telemetryByIdMap.get(id)

    if (!config && !modelData) return null

    const predictedValue = modelData 
      ? calculateRawPolynomial(engineSpeed, brakingPower, modelData.coefficients)
      : 0

    return (
      <CircularGaugeCard
        key={id}
        modelKey={modelName ?? `ID-${id}`}
        label={config?.Parameter ?? modelData?.features.z_axis ?? ''}
        value={predictedValue}
        r2Score={modelData?.metrics.r2_score ?? 0}
        minConfig={config?.Min}
        maxConfig={config?.Max}
        unitConfig={config?.Unit}
      />
    )
  }

  return (
    <div className="relative h-screen w-full bg-[#121212] text-slate-300 overflow-hidden select-none p-3">
      <style dangerouslySetInnerHTML={{ __html: `
        *::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />

      <main className="h-full w-full flex flex-col gap-6 overflow-y-auto pr-1 pb-36">
        
        {/* 1. EXHAUST TEMP CYLINDER 1-6 (Sebaris 6 Kolom) */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-sky-400 font-mono uppercase tracking-wider">
            1. Exhaust Temperature Cylinder 1 - 6 ({cylinderExhaustIds.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cylinderExhaustIds.map(renderGauge)}
          </div>
        </div>

        {/* 2. HTCW TEMPERATURE CYLINDER 1-6 (Sebaris 6 Kolom) */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-sky-400 font-mono uppercase tracking-wider">
            2. HTCW Temperature Cylinder 1 - 6 ({cylinderHtcwIds.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cylinderHtcwIds.map(renderGauge)}
          </div>
        </div>

        {/* 3. EXHAUST & TURBOCHARGER OTHER */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
            3. Exhaust & Turbocharger Parameters ({exhaustTurboIds.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {exhaustTurboIds.map(renderGauge)}
          </div>
        </div>

        {/* 4. HTCW SYSTEM OTHER */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
            4. High-Temperature Cooling Water System ({htcwSystemIds.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {htcwSystemIds.map(renderGauge)}
          </div>
        </div>

        {/* 5. LTCW SYSTEM */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
            5. Low-Temperature Cooling Water System ({ltcwSystemIds.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ltcwSystemIds.map(renderGauge)}
          </div>
        </div>

        {/* 6. LUBE OIL SYSTEM */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
            6. Lube Oil System ({lubeOilIds.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {lubeOilIds.map(renderGauge)}
          </div>
        </div>

        {/* 7. CHARGE AIR & FUEL SYSTEM */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
            7. Charge Air & Fuel System ({chargeAirFuelIds.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {chargeAirFuelIds.map(renderGauge)}
          </div>
        </div>

      </main>

      {/* Control Panel Floating di Tengah Bawah */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-auto">
        <SimulatorControlPanel
          engineSpeed={engineSpeed}
          setEngineSpeed={setEngineSpeed}
          brakingPower={brakingPower}
          setBrakingPower={setBrakingPower}
          minSpeedSlider={minSpeedSlider}
          maxSpeedSlider={maxSpeedSlider}
        />
      </div>
    </div>
  )
}