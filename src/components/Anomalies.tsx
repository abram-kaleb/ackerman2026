import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const Box7 = () => {
  const [engineData, setEngineData] = useState({
    health: 0,
    rul: "N/A",
    status: "AI_OFFLINE",
    maintenance_scope: [],
    ai_insight: ""
  });

  useEffect(() => {
    socket.on('monitoringUpdate', (payload) => {
      if (payload && payload.length > 0) {
        const data = payload[0];
        setEngineData({
          health: data.ai_health || 0,
          rul: data.ai_rul || "N/A",
          status: data.ai_status || "AI_OFFLINE",
          maintenance_scope: data.maintenance_scope || [],
          ai_insight: data.ai_insight || ""
        });
      }
    });
    return () => socket.off('monitoringUpdate');
  }, []);

  const isAiActive = engineData.status !== "AI_OFFLINE";

  return (
    <div className="bg-[#212121] flex flex-col p-6 text-[#9ca3af] rounded-2xl h-full w-full relative overflow-hidden">
      <div className="flex justify-between items-center w-full mb-8 z-10">
        <h1 className="text-white text-center bg-black px-3 py-1.5 text-sm font-bold uppercase">
          Ai Analysis
        </h1>
        <span className="text-xl">...</span>
      </div>

      <div className="w-full space-y-6 overflow-y-auto">
        <div className="w-full">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium uppercase">Engine overall Health</span>
            <span className={`font-bold text-lg ${isAiActive ? 'text-[#4ade80]' : 'text-gray-600'}`}>
              {isAiActive ? `${engineData.health}% - ${engineData.rul}` : "Offline"}
            </span>
          </div>
          <div className="w-full bg-[#1f2937] h-2.5 rounded-full">
            <div 
              className="h-full rounded-full bg-[#22c55e] transition-all duration-1000"
              style={{ width: `${isAiActive ? engineData.health : 0}%` }}
            />
          </div>
        </div>

        {isAiActive && (
          <div className="mt-2 p-3 bg-blue-950/20 border-l-2 border-blue-400 rounded-r shadow-md">
            <h3 className="text-[9px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Llama 3.2 Analysis
            </h3>
            <p className="text-[11px] text-gray-200 italic leading-relaxed">
              {engineData.ai_insight || "AI sedang menganalisis kondisi mesin..."}
            </p>
          </div>
        )}

        {!isAiActive && (
          <div className="mt-6 text-[10px] text-red-900 animate-pulse font-bold uppercase">
            System Warning: AI Analysis Bridge is Disconnected
          </div>
        )}
      </div>
    </div>
  );
};

export default Box7;