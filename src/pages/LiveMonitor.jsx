import { useState } from "react";
import { Layout } from "../components/Layout";
import { VideoPlayer } from "../components/VideoPlayer";
import { DetectionLog } from "../components/DetectionLog";

const cameras = ["Cam A-01", "Cam A-02", "Cam B-01", "Cam C-01"];

export function LiveMonitor() {
  const [activeCam, setActiveCam] = useState("Cam A-01");

  return (
    <Layout>
      <div className="page-content">
        <header className="page-header">
          <div>
            <h1 className="page-heading">Live Monitor CCTV</h1>
            <p className="page-subtitle">Pantauan kebun kakao dengan overlay deteksi AI real-time</p>
          </div>
        </header>

        <section className="monitor-layout" aria-label="Pemantauan kamera kebun">
          <div className="monitor-main">
            <div className="monitor-player">
              <VideoPlayer
                showOverlayControl
                activeCam={activeCam}
                onCameraChange={setActiveCam}
                timestamp="2026-10-14 21:07:13"
              />
            </div>
            <div className="camera-grid" aria-label="Pilih kamera">
              {cameras.map((camera) => (
                <button
                  className={`camera-thumb${activeCam === camera ? " selected" : ""}`}
                  key={camera}
                  type="button"
                  onClick={() => setActiveCam(camera)}
                  aria-pressed={activeCam === camera}
                  aria-label={`Tampilkan ${camera}`}
                >
                  <span className="camera-name">{camera}</span>
                </button>
              ))}
            </div>
          </div>
          <aside className="monitor-sidebar">
            <DetectionLog showWarning />
          </aside>
        </section>
      </div>
    </Layout>
  );
}
