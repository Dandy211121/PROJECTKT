import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MonitorPlay,
  BarChart3,
  Map as MapIcon,
  Settings,
  Leaf,
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Live Monitor", href: "/monitor", icon: MonitorPlay },
  { name: "Analitik Panen", href: "/analytics", icon: BarChart3 },
  { name: "Peta Blok Kebun", href: "/map", icon: MapIcon },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-600 flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-200">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <Leaf className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight">
            Cocoa<span className="text-emerald-600">Sense</span>
          </h1>
          <p className="text-xs text-slate-500">AI Maturity Detection</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100">
          <p className="text-slate-500 mb-1">Status Sistem</p>
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Online & Active
          </div>
        </div>
      </div>
    </aside>
  );
}
