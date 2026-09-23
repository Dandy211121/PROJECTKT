import { Layout } from "../components/Layout";

export function Settings() {
  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-4xl">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500">Konfigurasi CCTV AI dan notifikasi</p>
        </header>
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4 border-b border-slate-200 pb-2">Konfigurasi AI Model</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Confidence Threshold (%)</label>
                <input type="range" className="w-full md:w-1/2 accent-emerald-500" defaultValue="85" />
                <p className="text-xs text-slate-500 mt-1">Deteksi dengan nilai confidence di bawah batas ini akan diabaikan (85%).</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4 border-b border-slate-200 pb-2">Notifikasi & Alert</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-700">Alert Panen (Matang &gt; 70%)</p>
                  <p className="text-xs text-slate-500">Kirim notifikasi jika blok siap panen.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
