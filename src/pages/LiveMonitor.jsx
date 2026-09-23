import { Layout } from "../components/Layout";
import { VideoPlayer } from "../components/VideoPlayer";
import { DetectionLog } from "../components/DetectionLog";

export function LiveMonitor() {
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] gap-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Live Monitor CCTV</h1>
          <p className="text-sm text-slate-500">Pantauan kebun kakao dengan overlay deteksi AI real-time</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 min-h-[400px]">
              <VideoPlayer showOverlayControl={true} />
            </div>
            
            {/* Thumbnail Cameras */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-32 shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-100 border border-slate-200 rounded-lg overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1611843467160-25afb8cf1074?q=80&w=500&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity">
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-medium backdrop-blur-sm border border-white/20">
                    Cam {['A-01', 'A-02', 'B-01', 'C-01'][i-1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col h-[500px] lg:h-auto">
            <DetectionLog />
          </div>
        </div>
      </div>
    </Layout>
  );
}
