import { AlertTriangle, Camera, Clock } from "lucide-react";
import { recentDetections } from "../data/mockData";

const tones = {
  yellow: { color: "#FFD444", text: "#594200" },
  green: { color: "#8ACFF8", text: "#064365" },
  red: { color: "#006199", text: "#ffffff", background: "#006199" },
};

export function DetectionLog({ showWarning = false }) {
  return (
    <section className="glass-card detection-card" aria-label="Riwayat Deteksi Terkini">
      <header className="detection-header">
        <div className="detection-title-wrap">
          <Clock size={16} strokeWidth={1.8} aria-hidden="true" />
          <h2 className="card-heading">Riwayat Deteksi Terkini</h2>
        </div>
        <button className="text-link" type="button">Lihat Semua</button>
      </header>

      <div className="detection-list">
        {recentDetections.map((log) => (
          <article className="detection-row" key={log.id}>
            <div
              className="detection-thumb"
              style={{ "--tone": (tones[log.color] ?? tones.green).color }}
              aria-hidden="true"
            >
              <Camera />
            </div>
            <div className="detection-detail">
              <div className="detection-meta">
                <p className="detection-camera">
                  {log.camera} <span className="detection-block">({log.block})</span>
                </p>
                <time className="detection-time">{log.timestamp.split(" ")[1]}</time>
              </div>
              <div className="detection-status-row">
                <span
                  className="status-chip"
                  style={{
                    "--tone": (tones[log.color] ?? tones.green).color,
                    "--tone-text": (tones[log.color] ?? tones.green).text,
                    "--tone-background": (tones[log.color] ?? tones.green).background,
                  }}
                >
                  {log.status}
                </span>
                <span className="confidence">Confidence: <strong>{log.confidence}%</strong></span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showWarning && (
        <aside className="warning-card">
          <AlertTriangle aria-hidden="true" />
          <div>
            <p className="warning-title">Peringatan: Blok A</p>
            <p className="warning-copy">
              Persentase buah siap panen melebihi 70%. Jadwalkan panen segera.
            </p>
          </div>
        </aside>
      )}
    </section>
  );
}
