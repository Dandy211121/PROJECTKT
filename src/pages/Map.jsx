import { Layout } from "../components/Layout";
import { MapPin } from "lucide-react";

export function Map() {
  return (
    <Layout>
      <div className="flex flex-col gap-6 h-full">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Peta Blok Kebun</h1>
          <p className="text-sm text-slate-500">Visualisasi lokasi CCTV dan status kematangan per blok</p>
        </header>
        
        <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden min-h-[500px] shadow-sm">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1592982537447-6f233486be78?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <MapPin className="w-16 h-16 text-emerald-500 opacity-60" />
            <p className="text-slate-600 font-medium bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-200">Integrasi Peta Interaktif akan ditampilkan di sini</p>
            <div className="flex gap-4 mt-4 bg-white/80 p-3 rounded-lg backdrop-blur-sm border border-slate-200">
              <span className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Blok A (Aman)
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span> Blok B (Panen)
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Blok C (Perhatian)
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
