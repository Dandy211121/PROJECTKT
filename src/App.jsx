import React, { useState, useEffect } from "react";
import { Icon } from "./ui.jsx";
import * as Pg from "./pages.jsx";
const MAIN = [
  ["dashboard", "Dashboard", "grid"],
  ["deteksi", "Deteksi Kakao", "scan"],
  ["analisis", "Analisis Panen", "chart"],
  ["monitor", "Live Monitor", "vid"],
];
const MORE = [
  ["kebun", "Kebun dan Blok", "leaf"],
  ["kamera", "Kamera", "cam"],
  ["riwayat", "Riwayat Deteksi", "hist"],
  ["pengaturan", "Pengaturan", "set"],
];
const PAGES = {
  dashboard: Pg.Dashboard,
  deteksi: Pg.Deteksi,
  analisis: Pg.Analisis,
  monitor: Pg.Monitor,
  kebun: Pg.Kebun,
  kamera: Pg.Kamera,
  riwayat: Pg.Riwayat,
  pengaturan: Pg.Pengaturan,
};
export default function App() {
  const read = () => location.hash.slice(1) || "dashboard";
  const [pg, setPg] = useState(read),
    [menu, setMenu] = useState(false),
    [more, setMore] = useState(false),
    [bell, setBell] = useState(false),
    [tm, setTm] = useState("");
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
    setMore(false);
  };
  const toast = (m) => {
    setTm(m);
    setTimeout(() => setTm(""), 2600);
  };
  const Page = PAGES[pg] || Pg.Dashboard,
    isMore = MORE.some((m) => m[0] === pg);
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
            <div className="dd">
              <button
                className={"nl" + (isMore ? " on" : "")}
                onClick={() => setMore(!more)}
              >
                Kelola
                <Icon n="chev" s={15} />
              </button>
              {more && <div className="menu">{MORE.map(Item)}</div>}
            </div>
          </nav>
          <div className="right">
            <select className="sel kb" aria-label="Pilih kebun">
              <option>Kebun Sumber Rejeki</option>
              <option>Kebun Lereng Timur</option>
            </select>
            <div className="dd">
              <button
                className="ib"
                aria-label="Notifikasi"
                onClick={() => setBell(!bell)}
              >
                <Icon n="bell" />
                <b />
              </button>
              {bell && (
                <div className="menu r">
                  <div>
                    <b>Kamera D-01 offline</b>
                    <small>12 menit lalu</small>
                  </div>
                  <div>
                    <b>14 buah terlalu matang di Blok C</b>
                    <small>1 jam lalu</small>
                  </div>
                </div>
              )}
            </div>
            <div className="av" title="Hendra Saputra">
              HS
            </div>
            <button
              className="ib burger"
              aria-label="Menu"
              onClick={() => setMenu(!menu)}
            >
              <Icon n="menu" />
            </button>
          </div>
        </header>
        {menu && <div className="mob">{[...MAIN, ...MORE].map(Item)}</div>}
      </div>
      <main key={pg}>
        <Page go={go} toast={toast} />
        <footer>
          <span>© 2026 Kaora App · Seluruh data adalah data simulasi</span>
          <span>Sinkronisasi terakhir: 08:02 WIB</span>
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
