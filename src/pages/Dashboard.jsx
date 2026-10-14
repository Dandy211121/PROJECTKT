import { AlertCircle, CheckCircle2, Leaf, Target } from "lucide-react";
import { Layout } from "../components/Layout";
import { StatsCard } from "../components/StatsCard";
import { VideoPlayer } from "../components/VideoPlayer";
import { DetectionLog } from "../components/DetectionLog";
import { BlockDistributionChart, MaturityTrendChart } from "../components/Charts";
import { kpiData } from "../data/mockData";

export function Dashboard() {
  return (
    <Layout>
      <div className="page-content">
        <header className="page-header">
          <div>
            <h1 className="page-heading">Dashboard</h1>
            <p className="page-subtitle">Ringkasan pemantauan kebun kakao secara real-time</p>
          </div>
          <div className="header-filters">
            <select className="glass-select" aria-label="Pilih blok">
              <option>Semua Blok</option>
              <option>Blok A</option>
              <option>Blok B</option>
              <option>Blok C</option>
            </select>
            <select className="glass-select" aria-label="Pilih periode">
              <option>Hari Ini</option>
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
            </select>
          </div>
        </header>

        <section className="stats-grid" aria-label="Ringkasan deteksi">
          <StatsCard
            title="Total Buah Terdeteksi"
            value={kpiData.totalDetected}
            icon={Target}
            colorVariant="ocean"
            trend="+12%"
          />
          <StatsCard
            title="Siap Panen (Matang)"
            value={kpiData.ripePods}
            icon={CheckCircle2}
            colorVariant="gold"
            trend="+5%"
            subtitle="56% dari total"
          />
          <StatsCard
            title="Mentah"
            value={kpiData.unripePods}
            icon={Leaf}
            colorVariant="sky"
            subtitle="35% dari total"
          />
          <StatsCard
            title="Terlalu Matang / Busuk"
            value={kpiData.overripeDiseased}
            icon={AlertCircle}
            colorVariant="lemon"
            trend="-2%"
            subtitle="9% dari total"
          />
        </section>

        <section className="dashboard-main-grid" aria-label="Pemantauan langsung dan riwayat">
          <div className="dashboard-video">
            <VideoPlayer timestamp="2026-10-14 21:07:00" />
          </div>
          <div className="dashboard-right">
            <DetectionLog />
          </div>
        </section>

        <section className="chart-grid" aria-label="Grafik kematangan dan distribusi">
          <article className="glass-card hover-card chart-card">
            <div className="chart-heading-row">
              <div>
                <h2 className="card-heading">Tren Kematangan (4 Minggu)</h2>
                <p className="chart-description">Perubahan jumlah buah berdasarkan tingkat kematangan</p>
              </div>
            </div>
            <MaturityTrendChart />
          </article>
          <article className="glass-card hover-card chart-card">
            <div className="chart-heading-row">
              <div>
                <h2 className="card-heading">Distribusi per Blok</h2>
                <p className="chart-description">Sebaran buah terpantau pada setiap area</p>
              </div>
            </div>
            <BlockDistributionChart />
          </article>
        </section>
      </div>
    </Layout>
  );
}
