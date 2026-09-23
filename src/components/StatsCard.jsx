import { cn } from "../lib/utils";

export function StatsCard({ title, value, icon: Icon, subtitle, trend, colorVariant = "emerald" }) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    red: "text-red-600 bg-red-50 border-red-100",
    slate: "text-slate-600 bg-slate-50 border-slate-200",
  };

  const bgMap = {
    emerald: "from-emerald-50 to-transparent",
    amber: "from-amber-50 to-transparent",
    red: "from-red-50 to-transparent",
    slate: "from-slate-50 to-transparent",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-white border border-slate-200 p-5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md",
    )}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", bgMap[colorVariant])} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className={cn("p-2 rounded-lg border", colorMap[colorVariant])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          {trend && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
