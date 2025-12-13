import React, { useState } from 'react';
import { X, Save, Plus, Eye, EyeOff, Layout, Trash2 } from 'lucide-react';
import { WidgetConfig, DashboardLayout, WidgetType, Language } from '../types';
import { translations } from '../App';

interface DashboardConfigProps {
  isOpen: boolean;
  onClose: () => void;
  currentLayout: DashboardLayout;
  savedLayouts: DashboardLayout[];
  onSaveLayout: (layout: DashboardLayout) => void;
  onLoadLayout: (layoutId: string) => void;
  onDeleteLayout: (layoutId: string) => void;
  onUpdateWidgets: (widgets: WidgetConfig[]) => void;
  lang: Language;
}

const getWidgetTemplates = (lang: Language): { type: WidgetType; title: string; defaultSize: { w: number; h: number } }[] => {
  const t = translations[lang];
  return [
    { type: 'summary', title: t.dashboard.general_summary, defaultSize: { w: 12, h: 2 } },
    { type: 'radar', title: t.dashboard.brand_comparison, defaultSize: { w: 4, h: 4 } },
    { type: 'pie', title: t.dashboard.cost_distribution, defaultSize: { w: 4, h: 4 } },
    { type: 'retention', title: t.dashboard.retention, defaultSize: { w: 4, h: 4 } },
    { type: 'line', title: t.dashboard.temporal_trends, defaultSize: { w: 12, h: 3 } },
    { type: 'heatmap', title: t.dashboard.frequency_heatmap, defaultSize: { w: 12, h: 4 } },
    { type: 'metrics', title: t.dashboard.metrics_table, defaultSize: { w: 6, h: 5 } },
    { type: 'anomalies', title: t.dashboard.anomalies, defaultSize: { w: 6, h: 5 } },
  ];
};

export const DashboardConfig: React.FC<DashboardConfigProps> = ({
  isOpen,
  onClose,
  currentLayout,
  savedLayouts,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
  onUpdateWidgets,
  lang,
}) => {
  const t = translations[lang];
  const widgetTemplates = getWidgetTemplates(lang);
  const [layoutName, setLayoutName] = useState(currentLayout.name);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(currentLayout.widgets);

  if (!isOpen) return null;

  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(updatedWidgets);
  };

  const handleSave = () => {
    const newLayout: DashboardLayout = {
      ...currentLayout,
      name: layoutName,
      widgets: widgets,
    };
    onSaveLayout(newLayout);
    onUpdateWidgets(widgets);
  };

  const addWidget = (type: WidgetType) => {
    const template = widgetTemplates.find((t) => t.type === type);
    if (!template) return;

    // Generate unique ID with timestamp + random string
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      title: template.title,
      enabled: true,
    };

    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-[95%] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Layout className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.dashboard.configure_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Layout Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t.dashboard.layout_name}
            </label>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder={t.dashboard.placeholder}
            />
          </div>

          {/* Current Widgets */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t.dashboard.current_widgets}
            </h3>
            <div className="space-y-2">
              {widgets.map((widget) => {
                const template = widgetTemplates.find(t => t.type === widget.type);
                const displayTitle = template ? template.title : widget.title;
                return (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleWidget(widget.id)}
                        className={`p-1.5 rounded ${
                          widget.enabled
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                        }`}
                      >
                        {widget.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {displayTitle}
                      </span>
                    </div>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Widgets */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t.dashboard.add_widgets}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {widgetTemplates.map((template) => {
                const countOfType = widgets.filter((w) => w.type === template.type).length;
                const maxReached = countOfType >= 3;
                return (
                  <button
                    key={template.type}
                    onClick={() => !maxReached && addWidget(template.type)}
                    disabled={maxReached}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      maxReached
                        ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Plus size={16} />
                      <span className="text-sm font-medium">
                        {template.title}
                        {countOfType > 0 && (
                          <span className="text-[10px] text-slate-500 ml-1">({countOfType}/3)</span>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saved Layouts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t.dashboard.saved_layouts}
            </h3>
            <div className="space-y-2">
              {savedLayouts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  {t.dashboard.no_saved_layouts}
                </p>
              ) : (
                savedLayouts.map((layout) => (
                  <div
                    key={layout.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {layout.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLoadLayout(layout.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        {t.dashboard.load}
                      </button>
                      {layout.id !== 'default' && (
                        <button
                          onClick={() => onDeleteLayout(layout.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
          >
            {t.dashboard.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            {t.dashboard.save}
          </button>
        </div>
      </div>
    </div>
  );
};
