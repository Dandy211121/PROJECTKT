import React, { useState, useEffect } from "react";
import { Icon } from "./ui.jsx";
import * as Pg from "./pages.jsx";
import { checkBackendHealth } from "./lib/api.js";
const MAIN = [
  ["dashboard", "Dashboard", "grid"],
  ["analisis", "Analisis Panen", "chart"],
  ["monitor", "Live Monitor", "vid"],
];
const PAGES = {
  dashboard: Pg.Dashboard,
  deteksi: Pg.Deteksi,
  analisis: Pg.Analisis,
  monitor: Pg.Monitor,
};
export default function App() {
  const read = () => location.hash.slice(1) || "dashboard";
  const [pg, setPg] = useState(read),
    [menu, setMenu] = useState(false),
    [tm, setTm] = useState(""),
    [backendStatus, setBackendStatus] = useState({ online: false, checking: true });

  const verifyBackend = async () => {
    const res = await checkBackendHealth();
    setBackendStatus({ online: res.online, checking: false, data: res.data });
  };

  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const f = () => {
      setPg(read());
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const go = (p) => {
    location.hash = p;
    setMenu(false);
  };
  const toast = (m) => {
    setTm(m);
    setTimeout(() => setTm(""), 2600);
  };
  const Page = PAGES[pg] || Pg.Dashboard;
  const Item = ([k, l, i]) => (
    <button
      key={k}
      className={"nl" + (pg === k ? " on" : "")}
      onClick={() => go(k)}
    >
      <Icon n={i} s={17} />
      {l}
    </button>
  );
  return (
    <div className="shell">
      <div className="top-wrap">
        <header className="topbar">
          <button className="brand" onClick={() => go("dashboard")}>
            <i>
              <Icon n="leaf" s={20} />
            </i>
            Kaora App
          </button>
          <nav className="links" aria-label="Navigasi utama">
            {MAIN.map(Item)}
          </nav>
          <div className="right">
            <button
              className={`backend-pill ${backendStatus.online ? "online" : "offline"}`}
              onClick={() => {
                verifyBackend();
                toast(backendStatus.online ? "Backend AI Aktif & Tersambung (FastAPI 127.0.0.1:8000)" : "Mencoba menghubungkan ulang ke backend...");
              }}
              title={backendStatus.online ? "Backend AI Aktif (FastAPI 127.0.0.1:8000)" : "Backend Offline - Klik untuk cek kembali"}
            >
              <span className="dot" />
              <span>{backendStatus.online ? "Backend: Online" : "Backend: Offline"}</span>
            </button>
            <button
              className="ib burger"
              aria-label="Menu"
              onClick={() => setMenu(!menu)}
            >
              <Icon n="menu" />
            </button>
          </div>
        </header>
        {menu && <div className="mob">{MAIN.map(Item)}</div>}
      </div>
      <main key={pg}>
        <Page go={go} toast={toast} backendStatus={backendStatus} />
        <footer>
          <span>© 2026 Kaora App · {backendStatus.online ? "Backend PyTorch AI Ensemble Aktif" : "Mode Simulasi"}</span>
          <span>{backendStatus.online ? "Status: Backend Terhubung (127.0.0.1:8000)" : "Backend: Terputus"}</span>
        </footer>
      </main>
      {tm && (
        <div className="toast" role="status">
          {tm}
        </div>
      )}
    </div>
  );
}
