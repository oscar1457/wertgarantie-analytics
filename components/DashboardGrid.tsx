import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GridLayout, verticalCompactor } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { DashboardData, Theme, WidgetConfig, LayoutItem } from '../types';
import { MainRadarChart, SimpleBarChart, MetricsTable, AnomalyList, TrendLineChart, CostPieChart, BrandMonthHeatmap } from './Charts';
import { MetricCard } from './MetricCard';
import { Euro, FileText, AlertTriangle, Zap, GripVertical } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DashboardGridProps {
  data: DashboardData;
  theme: Theme;
  layout: LayoutItem[];
  widgets: WidgetConfig[];
  onLayoutChange: (layout: Layout) => void;
  lang: 'es' | 'en' | 'de';
  t: any;
  editable: boolean;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  data,
  theme,
  layout,
  widgets,
  onLayoutChange,
  lang,
  t,
  editable
}) => {
  const [width, setWidth] = useState(1200);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const getWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case 'summary': return t.dashboard.general_summary;
      case 'radar': return t.dashboard.brand_comparison;
      case 'pie': return t.dashboard.cost_distribution;
      case 'retention': return t.dashboard.retention;
      case 'line': return t.dashboard.temporal_trends;
      case 'heatmap': return t.dashboard.frequency_heatmap;
      case 'metrics': return t.dashboard.metrics_table;
      case 'anomalies': return t.dashboard.anomalies;
      default: return widgetConfig.title;
    }
  };

  const renderWidget = useCallback((widgetConfig: WidgetConfig) => {
    if (!widgetConfig.enabled) return null;
    const translatedTitle = getWidgetTitle(widgetConfig.type);

    const widgetClass = `bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-3 flex flex-col h-full overflow-hidden`;

    switch (widgetConfig.type) {
      case 'summary':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 flex-1">
              <MetricCard
                title={t.summary.cost}
                value={`€${data.summary.totalRevenue.toLocaleString(lang === 'de' ? 'de-DE' : lang === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 0 })}`}
                trend={t.summary.analyzed}
                trendDirection="neutral"
                icon={<Euro size={14} />}
                active={true}
              />
              <MetricCard
                title={t.summary.records}
                value={data.summary.activePolicies.toLocaleString()}
                trend={t.summary.rows}
                trendDirection="neutral"
                icon={<FileText size={14} />}
              />
              <MetricCard
                title={t.summary.risk}
                value={`${data.summary.claimRatio.toFixed(1)}%`}
                trend={t.summary.risk}
                trendDirection="down"
                icon={<AlertTriangle size={14} />}
              />
              <MetricCard
                title={t.summary.efficiency}
                value={t.summary.high}
                trend={t.summary.kpi}
                trendDirection="up"
                icon={<Zap size={14} />}
              />
            </div>
          </div>
        );

      case 'radar':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
              {translatedTitle}
            </h3>
            <div className="flex-1 min-h-0">
              <MainRadarChart data={data.charts.radarData} theme={theme} />
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
              {translatedTitle}
            </h3>
            <div className="flex-1 min-h-0">
              {data.charts.costDistribution.length > 0 ? (
                <CostPieChart data={data.charts.costDistribution} theme={theme} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  {t.statistics.no_data}
                </div>
              )}
            </div>
          </div>
        );

      case 'retention':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
              {translatedTitle}
            </h3>
            <div className="flex-1 min-h-0">
              <SimpleBarChart data={data.charts.retentionData} color="#3b82f6" theme={theme} />
            </div>
          </div>
        );

      case 'line':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
              {translatedTitle}
            </h3>
            <div className="flex-1 min-h-0">
              {data.charts.trendData.length > 0 ? (
                <TrendLineChart data={data.charts.trendData} theme={theme} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  {t.statistics.no_temporal_data}
                </div>
              )}
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
              {translatedTitle}
            </h3>
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
              {data.charts.heatmapData.length > 0 ? (
                <BrandMonthHeatmap data={data.charts.heatmapData} theme={theme} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  {t.statistics.no_heatmap_data}
                </div>
              )}
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
              {translatedTitle}
            </h3>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <MetricsTable data={data.topBrands} theme={theme} t={t} />
            </div>
          </div>
        );

      case 'anomalies':
        return (
          <div className={widgetClass}>
            {editable && (
              <div className="drag-handle flex items-center gap-1 mb-2 text-slate-400 text-xs cursor-move">
                <GripVertical size={12} />
                <span className="font-semibold">{translatedTitle}</span>
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">
              {translatedTitle}
            </h3>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <AnomalyList anomalies={data.anomalies} lang={lang} />
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [data, theme, editable, lang, t]);

  const filteredWidgets = useMemo(() =>
    widgets.filter((w) => w.enabled),
    [widgets]
  );

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <GridLayout
        className="layout"
        layout={layout}
        width={width}
        onLayoutChange={onLayoutChange}
        compactor={verticalCompactor}
        gridConfig={{
          cols: 12,
          rowHeight: 60,
          margin: [6, 6],
          containerPadding: [0, 0],
          maxRows: Infinity
        }}
        dragConfig={{
          enabled: editable,
          bounded: false,
          handle: editable ? '.drag-handle' : undefined,
          threshold: 3
        }}
        resizeConfig={{
          enabled: editable,
          handles: ['se']
        }}
        autoSize={true}
      >
        {filteredWidgets.map((widget) => (
          <div key={widget.id} className="dashboard-widget">
            {renderWidget(widget)}
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
