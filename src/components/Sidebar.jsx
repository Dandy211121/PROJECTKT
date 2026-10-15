import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MonitorPlay,
  BarChart3,
} from "lucide-react";
import { checkBackendHealth } from "../lib/api";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Live Monitor", href: "/monitor", icon: MonitorPlay },
  { name: "Analitik Panen", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  const [isBackendOnline, setIsBackendOnline] = useState(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const res = await checkBackendHealth();
      if (mounted) setIsBackendOnline(res.online);
    };
    check();
    const interval = setInterval(check, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          className="brand-mark"
          src="/cocoa-sense-logo.png"
          alt=""
          aria-hidden="true"
        />
        <div className="brand-copy">
          <h1 className="brand-name">
            Cocoa<span>Sense</span>
          </h1>
          <p className="brand-subtitle">AI Maturity Detection</p>
        </div>
      </div>

      <p className="sidebar-label">Menu Utama</p>
      <nav className="nav-list" aria-label="Navigasi utama">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-link${isActive ? " active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              title={item.name}
            >
              <item.icon aria-hidden="true" />
              <span className="nav-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div
        className="system-card"
        title={isBackendOnline ? "Backend AI Online & Terhubung" : "Backend AI Offline (Mode Mock)"}
      >
        <div className="system-card-copy">
          <p className="system-card-label">Status Sistem</p>
          <div
            className="system-state"
            style={{ color: isBackendOnline ? "#4ade80" : isBackendOnline === false ? "#facc15" : "#94a3b8" }}
          >
            <span
              className="system-dot"
              style={{ background: isBackendOnline ? "#22c55e" : isBackendOnline === false ? "#eab308" : "#94a3b8" }}
              aria-hidden="true"
            />
            {isBackendOnline === null
              ? "Menghubungkan..."
              : isBackendOnline
              ? "AI Backend: Online"
              : "Backend: Offline (Mock)"}
          </div>
        </div>
      </div>
    </aside>
  );
}
