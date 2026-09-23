import { Layout } from "../components/Layout";
import { MaturityTrendChart, BlockDistributionChart } from "../components/Charts";

export function Analytics() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Analitik Panen</h1>
          <p className="text-sm text-slate-500">Analisis data mendalam terkait kematangan dan hasil panen</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6 text-lg">Tren Kematangan (6 Bulan Terakhir)</h3>
            <div className="h-[400px]">
              <MaturityTrendChart />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6 text-lg">Distribusi per Blok Area</h3>
            <div className="h-[400px]">
              <BlockDistributionChart />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
