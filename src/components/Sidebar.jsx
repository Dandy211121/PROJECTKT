import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MonitorPlay,
  BarChart3,
  Leaf,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Live Monitor", href: "/monitor", icon: MonitorPlay },
  { name: "Analitik Panen", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Leaf size={23} strokeWidth={1.7} />
        </div>
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
      
      <div className="system-card" title="Online & Active">
        <span className="system-dot" aria-hidden="true" />
        <div className="system-card-copy">
          <p className="system-card-label">Status Sistem</p>
          <div className="system-state">
            Online &amp; Active
          </div>
        </div>
      </div>
    </aside>
  );
}
