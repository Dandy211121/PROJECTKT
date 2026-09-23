import { Clock, AlertTriangle } from "lucide-react";
import { recentDetections } from "../data/mockData";
import { cn } from "../lib/utils";

export function DetectionLog() {
  const colorMap = {
    yellow: "text-amber-600 bg-amber-50 border-amber-200",
    green: "text-emerald-600 bg-emerald-50 border-emerald-200",
    red: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Riwayat Deteksi Terkini
        </h3>
        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
          Lihat Semua
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {recentDetections.map((log) => (
            <div 
              key={log.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                {/* Mock Thumbnail */}
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>
                <div className={cn("w-3 h-3 rounded-full relative z-10", 
                  log.color === "yellow" ? "bg-amber-400" :
                  log.color === "green" ? "bg-emerald-400" : "bg-red-500"
                )}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{log.camera} <span className="text-slate-500 font-normal">({log.block})</span></p>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{log.timestamp.split(' ')[1]}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-md border font-medium",
                    colorMap[log.color]
                  )}>
                    {log.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    Confidence: <span className="text-slate-700 font-medium">{log.confidence}%</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Alert Banner Example */}
      <div className="p-4 m-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700">Peringatan: Blok A</p>
          <p className="text-xs text-red-600 mt-1">Persentase buah siap panen melebihi 70%. Jadwalkan panen segera.</p>
        </div>
      </div>
    </div>
  );
}
