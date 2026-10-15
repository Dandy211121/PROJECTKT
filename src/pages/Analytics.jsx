import { useEffect, useState } from "react";
import { Activity, BarChart3, Sprout } from "lucide-react";
import { Layout } from "../components/Layout";
import { BlockDistributionChart, MaturityTrendChart } from "../components/Charts";
import { kpiData } from "../data/mockData";
import { fetchAnalyticsSummary } from "../lib/api";

export function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadSummary = async () => {
      try {
        const data = await fetchAnalyticsSummary();
        if (mounted) setAnalytics(data);
      } catch {
        console.warn("Backend analytics belum aktif, menggunakan mock data.");
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
  return (
    <Layout>
      <div className="page-content">
        <header className="page-header">
          <div>
            <h1 className="page-heading">Analitik Panen</h1>
            <p className="page-subtitle">Analisis data mendalam terkait kematangan dan hasil panen</p>
          </div>
        </header>

        <section className="analytics-grid" aria-label="Analisis kematangan dan distribusi">
          <article className="glass-card hover-card chart-card chart-card-large">
            <div className="chart-heading-row">
              <div>
                <h2 className="card-heading">Tren Kematangan (6 Bulan Terakhir)</h2>
                <p className="chart-description">Perbandingan tingkat kematangan setiap minggu</p>
              </div>
              <Activity size={17} color="#8ACFF8" aria-hidden="true" />
            </div>
            <MaturityTrendChart large />
          </article>
          <article className="glass-card hover-card chart-card chart-card-large">
            <div className="chart-heading-row">
              <div>
                <h2 className="card-heading">Distribusi per Blok Area</h2>
                <p className="chart-description">Jumlah buah terdeteksi berdasarkan blok kebun</p>
              </div>
              <BarChart3 size={17} color="#FFD444" aria-hidden="true" />
            </div>
            <BlockDistributionChart large />
          </article>
        </section>

        <section className="analytics-summary" aria-label="Ringkasan panen">
          <article className="glass-card summary-card">
            <div>
              <p className="summary-label">Siap Panen</p>
              <p className="summary-value">{ripePods.toLocaleString("id-ID")}</p>
            </div>
            <Sprout className="summary-icon" size={20} style={{ "--tone": "#FFD444" }} aria-hidden="true" />
          </article>
          <article className="glass-card summary-card">
            <div>
              <p className="summary-label">Buah Mentah</p>
              <p className="summary-value">{unripePods.toLocaleString("id-ID")}</p>
            </div>
            <Sprout className="summary-icon" size={20} style={{ "--tone": "#8ACFF8" }} aria-hidden="true" />
          </article>
          <article className="glass-card summary-card">
            <div>
              <p className="summary-label">Total Terdeteksi</p>
              <p className="summary-value">{totalDetected.toLocaleString("id-ID")}</p>
            </div>
            <Activity className="summary-icon" size={20} style={{ "--tone": "#8ACFF8" }} aria-hidden="true" />
          </article>
        </section>
      </div>
    </Layout>
  );
}
