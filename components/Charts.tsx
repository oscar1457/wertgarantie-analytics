import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { ChartDataPoint, Anomaly, BrandStat, Theme, TimelineDataPoint, PieChartDataPoint, HeatmapDataPoint, Language } from '../types';
import { AlertCircle, Smartphone, Wrench } from 'lucide-react';
import { translations } from '../App';

interface MainRadarProps {
  data: ChartDataPoint[];
  theme: Theme;
  lang?: Language;
}

const CustomRadarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-100 dark:border-slate-700 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-[200px] z-50 pointer-events-none">
        <h4 className="font-bold text-slate-800 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-700 pb-1 text-xs">{data.name}</h4>
        <div className="space-y-2 text-[10px]">
           <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium"><Wrench size={10} className="text-blue-500" /> Costo Avg</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 text-xs">€{data.originalValue?.toFixed(0) || data.value}</span>
           </div>
           {data.topModel && (
             <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="flex items-center gap-1 mb-1 text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-[9px]">
                  <Smartphone size={9} /> 
                  Modelo Frecuente
                </div>
                <div className="font-bold text-slate-700 dark:text-slate-200 text-xs mb-0.5">{data.topModel}</div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500">Reparación est. €{data.topModelPrice}</div>
             </div>
           )}
        </div>
      </div>
    );
  }
  return null;
};

export const MainRadarChart: React.FC<MainRadarProps> = React.memo(({ data, theme }) => {
  // Get computed CSS variable values from root
  const getPrimaryColor = () => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#2563eb';
    }
    return '#2563eb';
  };

  const getMutedForegroundColor = () => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-muted-foreground').trim() || '#64748b';
    }
    return '#64748b';
  };

  const getCardBorderColor = () => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-card-border').trim() || '#e2e8f0';
    }
    return '#e2e8f0';
  };

  const primaryColor = getPrimaryColor();
  const textColor = getMutedForegroundColor();
  const gridColor = getCardBorderColor();

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <defs>
              <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <PolarGrid gridType="polygon" stroke={gridColor} strokeWidth={1} strokeDasharray="4 4" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 700, dy: 3 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Costo"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={3}
              fill="url(#radarFill)"
              fillOpacity={0.6}
              isAnimationActive={true}
              activeDot={{ r: 5, fill: primaryColor, stroke: "#fff", strokeWidth: 2 }}
              dot={{ r: 3, fill: "#fff", stroke: primaryColor, strokeWidth: 1.5 }}
            />
            <Tooltip content={<CustomRadarTooltip />} cursor={false} wrapperStyle={{ outline: 'none', zIndex: 100 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export const SimpleBarChart: React.FC<{ data: ChartDataPoint[], color: string, theme: Theme }> = React.memo(({ data, color, theme }) => {
  // Get colors from CSS variables
  const getColor = (varName: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
    }
    return fallback;
  };

  const primaryColor = getColor('--color-primary', color);
  const textColor = getColor('--color-muted-foreground', '#64748b');
  const mutedColor = getColor('--color-muted', '#f1f5f9');
  const cardColor = getColor('--color-card', '#ffffff');
  const foregroundColor = getColor('--color-foreground', '#0f172a');

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, bottom: 0, top: 0 }}>
             <XAxis type="number" hide />
             <YAxis
              dataKey="name"
              type="category"
              width={80}
              tick={{fontSize: 7, fill: textColor, fontWeight: 600}}
              tickLine={false}
              axisLine={false}
              interval={0}
             />
             <Tooltip
              cursor={{fill: mutedColor, radius: 4}}
              contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '11px',
                  backgroundColor: cardColor,
                  color: foregroundColor
              }}
              formatter={(value: number) => [`${value}%`, 'Retención']}
             />
             <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={12}
              fill={primaryColor}
              animationDuration={1500}
              background={{ fill: mutedColor, radius: 4 }}
             />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export const MetricsTable: React.FC<{ data: BrandStat[], theme: Theme, t: any }> = React.memo(({ data, theme, t }) => {
    return (
        <div className="w-full h-full overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10 shadow-sm">
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                        <th className="py-2.5 px-2 font-bold text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-wider bg-white dark:bg-slate-800">{t.claims.brand}</th>
                        <th className="py-2.5 px-2 font-bold text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-wider text-right bg-white dark:bg-slate-800">{t.claims.claims}</th>
                        <th className="py-2.5 px-2 font-bold text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-wider text-right bg-white dark:bg-slate-800">{t.claims.avg_cost}</th>
                        <th className="py-2.5 px-2 font-bold text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-wider text-right bg-white dark:bg-slate-800">{t.claims.retention}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50/50 dark:border-slate-700/50">
                            <td className="py-2 px-2 font-bold text-slate-800 dark:text-slate-200 text-[10px]">{item.brand}</td>
                            <td className="py-2 px-2 text-slate-600 dark:text-slate-400 text-right font-medium text-[10px]">{item.claimCount}</td>
                            <td className="py-2 px-2 text-slate-600 dark:text-slate-400 text-right font-medium text-[10px]">€{item.avgCost.toFixed(0)}</td>
                            <td className="py-2 px-2 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.retentionRate > 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {item.retentionRate.toFixed(0)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export const AnomalyList: React.FC<{ anomalies: Anomaly[]; lang?: Language }> = React.memo(({ anomalies, lang = 'es' }) => {
    const t = translations[lang];
    if (anomalies.length === 0) return <div className="text-slate-400 dark:text-slate-500 text-[10px] py-4">{t.claims.no_anomalies_detected}</div>;

    return (
        <div className="space-y-2">
            {anomalies.map((anomaly, idx) => (
                <div key={idx} className="flex items-start p-2.5 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-50 dark:border-red-900/20 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm">
                    <div className="mt-0.5">
                        <AlertCircle size={12} className="text-red-500 dark:text-red-400" />
                    </div>
                    <div className="ml-2.5 flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                            <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate pr-2" title={anomaly.item}>{anomaly.item}</h4>
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 whitespace-nowrap">€{anomaly.cost}</span>
                        </div>
                        <p className="text-[9px] text-red-400 dark:text-red-300 leading-tight truncate" title={anomaly.reason}>{anomaly.reason}</p>
                    </div>
                </div>
            ))}
        </div>
    );
});

// Line Chart for Temporal Trends
export const TrendLineChart: React.FC<{ data: TimelineDataPoint[], theme: Theme }> = React.memo(({ data, theme }) => {
  const getColor = (varName: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
    }
    return fallback;
  };

  const primaryColor = getColor('--color-primary', '#2563eb');
  const accentColor = getColor('--color-accent', '#3b82f6');
  const textColor = getColor('--color-muted-foreground', '#64748b');
  const gridColor = getColor('--color-card-border', '#e2e8f0');
  const cardColor = getColor('--color-card', '#ffffff');
  const foregroundColor = getColor('--color-foreground', '#0f172a');

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="month"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tickFormatter={(value) => `€${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '11px',
                backgroundColor: cardColor,
                color: foregroundColor
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', fontWeight: 600 }}
              iconType="circle"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cost"
              stroke={primaryColor}
              strokeWidth={2.5}
              dot={{ fill: primaryColor, r: 4 }}
              activeDot={{ r: 6, fill: primaryColor, stroke: '#fff', strokeWidth: 2 }}
              name="Costo (€)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="claims"
              stroke={accentColor}
              strokeWidth={2.5}
              dot={{ fill: accentColor, r: 4 }}
              activeDot={{ r: 6, fill: accentColor, stroke: '#fff', strokeWidth: 2 }}
              name="Siniestros"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

// Pie Chart for Cost Distribution
export const CostPieChart: React.FC<{ data: PieChartDataPoint[], theme: Theme }> = React.memo(({ data, theme }) => {
  const getColor = (varName: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
    }
    return fallback;
  };

  const primaryColor = getColor('--color-primary', '#2563eb');
  const cardColor = getColor('--color-card', '#ffffff');
  const foregroundColor = getColor('--color-foreground', '#0f172a');
  const textColor = getColor('--color-muted-foreground', '#64748b');

  // Generate color palette based on primary color
  const COLORS = [
    primaryColor,
    `color-mix(in srgb, ${primaryColor} 70%, #ec4899)`,
    `color-mix(in srgb, ${primaryColor} 70%, #8b5cf6)`,
    `color-mix(in srgb, ${primaryColor} 70%, #06b6d4)`,
    `color-mix(in srgb, ${primaryColor} 70%, #10b981)`,
    `color-mix(in srgb, ${primaryColor} 50%, #f59e0b)`,
    `color-mix(in srgb, ${primaryColor} 30%, #6b7280)`,
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null; // Don't show labels for slices < 8%
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.75; // Position at 75% of the radius for better centering
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={CustomLabel}
              outerRadius="70%"
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '11px',
                backgroundColor: cardColor,
                color: foregroundColor
              }}
              itemStyle={{
                color: foregroundColor
              }}
              labelStyle={{
                color: foregroundColor
              }}
              formatter={(value: number, name: string, props: any) => [
                `€${value.toFixed(0)} (${props.payload.percentage.toFixed(1)}%)`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-shrink-0 px-2 pb-1 bg-white dark:bg-slate-800">
        <div className="grid grid-cols-2 gap-1 text-[8px]">
          {data.slice(0, 6).map((entry, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-slate-600 dark:text-slate-400 truncate font-medium">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Heatmap for Brand-Month Frequency
export const BrandMonthHeatmap: React.FC<{ data: HeatmapDataPoint[], theme: Theme }> = React.memo(({ data, theme }) => {
  const getColor = (varName: string, fallback: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
    }
    return fallback;
  };

  const primaryColor = getColor('--color-primary', '#2563eb');
  const textColor = getColor('--color-muted-foreground', '#64748b');

  // Get unique brands and months
  const brands = [...new Set(data.map(d => d.brand))].sort();
  const months = [...new Set(data.map(d => d.month))].sort();

  // Find max frequency for color scaling
  const maxFrequency = Math.max(...data.map(d => d.frequency), 1);

  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach(d => {
    dataMap.set(`${d.brand}-${d.month}`, d.frequency);
  });

  // Helper to get color intensity
  const getHeatColor = (frequency: number) => {
    if (frequency === 0) return 'var(--color-muted)';
    const intensity = frequency / maxFrequency;
    return `color-mix(in srgb, ${primaryColor} ${intensity * 100}%, var(--color-muted))`;
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="min-w-full inline-block">
        <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${months.length}, 1fr)` }}>
          {/* Header row */}
          <div className="sticky left-0 bg-white dark:bg-slate-800 z-10"></div>
          {months.map((month, idx) => (
            <div
              key={idx}
              className="text-[8px] font-bold text-center p-1 text-slate-600 dark:text-slate-400 uppercase tracking-wide"
            >
              {month}
            </div>
          ))}

          {/* Data rows */}
          {brands.map((brand, brandIdx) => (
            <React.Fragment key={brandIdx}>
              <div className="sticky left-0 bg-white dark:bg-slate-800 z-10 text-[9px] font-bold text-slate-700 dark:text-slate-300 pr-2 py-1 truncate">
                {brand}
              </div>
              {months.map((month, monthIdx) => {
                const frequency = dataMap.get(`${brand}-${month}`) || 0;
                return (
                  <div
                    key={monthIdx}
                    className="aspect-square rounded flex items-center justify-center text-[9px] font-bold transition-all hover:scale-110 hover:shadow-md cursor-pointer"
                    style={{
                      backgroundColor: getHeatColor(frequency),
                      color: frequency > maxFrequency * 0.5 ? '#fff' : textColor
                    }}
                    title={`${brand} - ${month}: ${frequency} siniestros`}
                  >
                    {frequency > 0 ? frequency : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});
