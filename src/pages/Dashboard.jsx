import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Leaf, Target } from "lucide-react";
import { Layout } from "../components/Layout";
import { StatsCard } from "../components/StatsCard";
import { VideoPlayer } from "../components/VideoPlayer";
import { DetectionLog } from "../components/DetectionLog";
import { BlockDistributionChart, MaturityTrendChart } from "../components/Charts";
import { kpiData } from "../data/mockData";
import { fetchAnalyticsSummary } from "../lib/api";

export function Dashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadSummary = async () => {
      try {
        const data = await fetchAnalyticsSummary();
        if (mounted) setAnalytics(data);
      } catch {
        // Fallback ke mockData
        console.warn("Backend analytics belum aktif, menggunakan data simulasi.");
      }
    };
    loadSummary();
    const interval = setInterval(loadSummary, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalDetected = analytics?.total_detected_pods ?? kpiData.totalDetected;
  const ripePods = analytics?.counts?.Mature ?? kpiData.ripePods;
  const unripePods = analytics?.counts?.Immature ?? kpiData.unripePods;
  const overripeDiseased = analytics?.counts?.Overmature ?? kpiData.overripeDiseased;
  const ripePct = analytics?.percentages?.Mature ? `${analytics.percentages.Mature}% dari total` : "56% dari total";
  const unripePct = analytics?.percentages?.Immature ? `${analytics.percentages.Immature}% dari total` : "35% dari total";
  const overripePct = analytics?.percentages?.Overmature ? `${analytics.percentages.Overmature}% dari total` : "9% dari total";

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
            value={totalDetected}
            icon={Target}
            colorVariant="ocean"
            trend="+12%"
          />
          <StatsCard
            title="Siap Panen (Matang)"
            value={ripePods}
            icon={CheckCircle2}
            colorVariant="gold"
            trend="+5%"
            subtitle={ripePct}
          />
          <StatsCard
            title="Mentah"
            value={unripePods}
            icon={Leaf}
            colorVariant="sky"
            subtitle={unripePct}
          />
          <StatsCard
            title="Terlalu Matang / Busuk"
            value={overripeDiseased}
            icon={AlertCircle}
            colorVariant="lemon"
            trend="-2%"
            subtitle={overripePct}
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
