import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import { maturityTrendData, blockDistributionData } from '../data/mockData';

const colors = {
  ripe: "#f59e0b", // amber-500
  unripe: "#10b981", // emerald-500
  overripe: "#ef4444" // red-500
};

export function MaturityTrendChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={maturityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <RechartsTooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0f172a' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="ripe" name="Matang Sempurna" stroke={colors.ripe} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="unripe" name="Mentah" stroke={colors.unripe} strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="overripe" name="Terlalu Matang/Busuk" stroke={colors.overripe} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BlockDistributionChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={blockDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <RechartsTooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="ripe" name="Matang" stackId="a" fill={colors.ripe} radius={[0, 0, 4, 4]} />
          <Bar dataKey="unripe" name="Mentah" stackId="a" fill={colors.unripe} />
          <Bar dataKey="overripe" name="Busuk" stackId="a" fill={colors.overripe} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
