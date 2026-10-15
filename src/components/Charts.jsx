import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { blockDistributionData, maturityTrendData } from "../data/mockData";

const colors = {
  overripe: "#006199",
  ripe: "#FFD444",
  unripe: "#8ACFF8",
};

const axisStyle = { fill: "#607b8b", fontSize: 10, fontFamily: "Inter, sans-serif" };
const tooltipStyle = {
  background: "rgba(255, 255, 255, 0.98)",
  border: "1px solid #dceaf1",
  borderRadius: "10px",
  color: "#173b52",
  boxShadow: "0 12px 32px rgba(19, 67, 93, 0.14)",
  fontSize: "11px",
  backdropFilter: "blur(10px)",
};
const legendItems = [
  { key: "ripe", label: "Matang Sempurna" },
  { key: "unripe", label: "Mentah" },
  { key: "overripe", label: "Terlalu Matang/Busuk" },
];
const distributionItems = [
  { key: "overripe", label: "Busuk" },
  { key: "ripe", label: "Matang" },
  { key: "unripe", label: "Mentah" },
];

function Legend({ items }) {
  return (
    <div className="chart-legend" aria-label="Keterangan grafik">
      {items.map((item) => (
        <span className="legend-item" key={item.key}>
          <span className="legend-swatch" style={{ "--swatch": colors[item.key] }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ChartGradients() {
  return (
    <defs>
      {Object.entries(colors).map(([name, color]) => (
        <linearGradient id={`fill-${name}`} key={name} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.23} />
          <stop offset="95%" stopColor={color} stopOpacity={0.005} />
        </linearGradient>
      ))}
    </defs>
  );
}

export function MaturityTrendChart({ large = false }) {
  return (
    <div className={`chart-frame${large ? " chart-frame-large" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={maturityTrendData} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
          <ChartGradients />
          <CartesianGrid stroke="#e4edf2" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={50} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#31596f", marginBottom: 5 }}
            itemStyle={{ color: "#173b52", padding: "2px 0" }}
            formatter={(value) => [Number(value).toLocaleString("id-ID"), ""]}
            cursor={{ stroke: "rgba(0, 97, 153, 0.18)", strokeDasharray: "3 4" }}
          />
          {legendItems.map((item) => (
            <Area
              key={item.key}
              type="natural"
              dataKey={item.key}
              name={item.label}
              stroke={colors[item.key]}
              strokeWidth={2}
              fill={`url(#fill-${item.key})`}
              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2, fill: colors[item.key] }}
              dot={{ r: 3, stroke: "#ffffff", strokeWidth: 1.5, fill: colors[item.key] }}
              style={{ filter: `drop-shadow(0 1px 3px ${colors[item.key]}44)` }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <Legend items={legendItems} />
    </div>
  );
}

export function BlockDistributionChart({ large = false }) {
  return (
    <div className={`chart-frame${large ? " chart-frame-large" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={blockDistributionData} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e4edf2" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={50} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#31596f", marginBottom: 5 }}
            itemStyle={{ color: "#173b52", padding: "2px 0" }}
            formatter={(value) => [Number(value).toLocaleString("id-ID"), ""]}
            cursor={{ fill: "rgba(0, 97, 153, 0.045)" }}
          />
          <Bar dataKey="unripe" name="Mentah" stackId="maturity" fill={colors.unripe} />
          <Bar dataKey="ripe" name="Matang" stackId="maturity" fill={colors.ripe} />
          <Bar
            dataKey="overripe"
            name="Busuk"
            stackId="maturity"
            fill={colors.overripe}
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <Legend items={distributionItems} />
    </div>
  );
}
