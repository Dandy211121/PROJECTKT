import { Target, CheckCircle2, AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { StatsCard } from "../components/StatsCard";
import { VideoPlayer } from "../components/VideoPlayer";
import { DetectionLog } from "../components/DetectionLog";
import { MaturityTrendChart, BlockDistributionChart } from "../components/Charts";
import { kpiData } from "../data/mockData";

export function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Ringkasan pemantauan kebun kakao secara real-time</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 shadow-sm">
              <option>Semua Blok</option>
              <option>Blok A</option>
              <option>Blok B</option>
              <option>Blok C</option>
            </select>
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 shadow-sm">
              <option>Hari Ini</option>
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
            </select>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Buah Terdeteksi" 
            value={kpiData.totalDetected.toLocaleString()} 
            icon={Target} 
            colorVariant="slate"
            trend="+12%"
          />
          <StatsCard 
            title="Siap Panen (Matang)" 
            value={kpiData.ripePods.toLocaleString()} 
            icon={CheckCircle2} 
            colorVariant="amber"
            trend="+5%"
            subtitle="56% dari total"
          />
          <StatsCard 
            title="Mentah" 
            value={kpiData.unripePods.toLocaleString()} 
            icon={Target} 
            colorVariant="emerald"
            subtitle="35% dari total"
          />
          <StatsCard 
            title="Terlalu Matang / Busuk" 
            value={kpiData.overripeDiseased.toLocaleString()} 
            icon={AlertCircle} 
            colorVariant="red"
            trend="-2%"
            subtitle="9% dari total"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Live Feed Miniature */}
            <div className="h-[400px]">
              <VideoPlayer />
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 text-sm">Tren Kematangan (4 Minggu)</h3>
                <MaturityTrendChart />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 text-sm">Distribusi per Blok</h3>
                <BlockDistributionChart />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex-1 min-h-[400px]">
              <DetectionLog />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
