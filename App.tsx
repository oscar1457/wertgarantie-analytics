import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainRadarChart, SimpleBarChart, MetricsTable, AnomalyList, TrendLineChart, CostPieChart, BrandMonthHeatmap } from './components/Charts';
import { FileHistory } from './components/FileHistory';
import { AuthScreen } from './components/AuthScreen';
import { DashboardGrid } from './components/DashboardGrid';
import { DashboardConfig } from './components/DashboardConfig';
import { emit } from '@tauri-apps/api/event';
import { MetricCard } from './components/MetricCard';
import { processFileLocally } from './services/analysisService';
import { DashboardData, AnalysisStatus, ViewState, Language, Theme, FileHistoryEntry, Session, DashboardLayout, WidgetConfig, LayoutItem } from './types';
import { useFileHistory } from './hooks/useFileHistory';
import { getCurrentSession, logout as logoutService, updateUserSettings } from './services/authService';
import { applyTheme, watchSystemTheme } from './services/themeService';
import { loadCurrentLayout, loadLayouts, saveLayout, deleteLayout, loadLayoutById, saveCurrentLayout } from './services/dashboardService';
import type { Layout as RGLLayout } from 'react-grid-layout';
import {
  UploadCloud,
  Bell,
  Euro,
  Zap,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
  Target,
  FileText,
  Moon,
  Sun,
  Globe,
  Droplet,
  Leaf,
  Circle,
  Settings2
} from 'lucide-react';

export const translations = {
  es: {
    nav: { overview: "Resumen", statistics: "Estadísticas", claims: "Siniestros", customers: "Clientes", analytics: "Diagnóstico", settings: "Configuración", history: "Historial" },
    summary: { cost: "Costo Total", records: "Registros", risk: "Siniestralidad", efficiency: "Eficiencia", analyzed: "Analizado", rows: "Filas", kpi: "KPI", high: "Alta" },
    overview: { title: "Análisis Comparativo", subtitle: "Comparación de Costos Promedio por Marca.", anomalies_title: "Anomalías y Datos", expensive_brand: "Marca Costosa", frequent_brand: "Más Frecuente", tip: "Tip:", tip_desc: "Pasa el cursor sobre los puntos para ver detalles.", no_anomalies: "No se encontraron anomalías.", unknown: "Desc.", na: "N/A" },
    statistics: { title: "Costos por Marca", retention_dist: "Distribución de Retención", cost_dist: "Distribución de Costos", no_data: "No hay datos", temporal_trends: "Tendencias Temporales", no_temporal_data: "No hay datos temporales", frequency_heatmap: "Frecuencia por Marca y Mes", no_heatmap_data: "No hay datos para heatmap" },
    claims: { title: "Desglose de Datos", categories: "Categorías", brand: "Marca", claims: "Siniestros", avg_cost: "Costo Avg", retention: "Retención", frequent_model: "Modelo Frecuente", estimated_repair: "Reparación est.", no_anomalies_detected: "No se detectaron anomalías." },
    customers: { retention_detected: "Retención Detectada", max_cost: "Costo Máximo", max_value_detected: "Valor más alto detectado." },
    analytics: { title: "Anomalías", subtitle: "Valores fuera de rango", summary_title: "Resumen del Archivo", structure: "Estructura", distribution: "Distribución", structure_desc: (rows: number, groups: number) => `Se analizaron ${rows} filas. Se identificaron ${groups} grupos únicos (marcas/modelos).`, distribution_desc: (avg: string) => `El costo promedio global es de €${avg}.` },
    settings: { title: "Configuración", subtitle: "Personaliza tu experiencia.", language: "Idioma", theme: "Tema", dark: "Oscuro", light: "Claro", auto: "Automático", blue: "Azul", purple: "Púrpura", green: "Verde", highContrastLight: "Alto Contraste (Claro)", highContrastDark: "Alto Contraste (Oscuro)", privateMode: "Modo Privado", privateModeDesc: "No guardar historial de archivos" },
    history: { title: "Historial de Archivos", empty: "No hay archivos en el historial", records: "Registros", total_cost: "Costo Total", size: "Tamaño", load: "Cargar análisis", clear_all: "Limpiar todo" },
    upload: { title: "Cargar Datos", subtitle: "Arrastra tu CSV, JSON o TXT. Análisis automático de costos y marcas.", button: "Seleccionar Archivo" },
    status: { analyzing: "Analizando...", patterns: "Identificando patrones", error_title: "Error en el análisis", error_desc: "No se pudieron extraer datos válidos.", retry: "Reintentar", file: "Archivo" },
    dashboard: { edit_mode: "Modo Edición", view_mode: "Modo Vista", configure: "Configurar Dashboard", configure_title: "Configurar Dashboard", layout_name: "Nombre del Layout", current_widgets: "Widgets Actuales", add_widgets: "Añadir Widgets", saved_layouts: "Layouts Guardados", no_saved_layouts: "No hay layouts guardados", load: "Cargar", cancel: "Cancelar", save: "Guardar Configuración", placeholder: "Mi Dashboard Personalizado", general_summary: "Resumen General", brand_comparison: "Comparación de Marcas", cost_distribution: "Distribución de Costos", retention: "Retención", temporal_trends: "Tendencias Temporales", frequency_heatmap: "Frecuencia por Marca y Mes", metrics_table: "Tabla de Métricas", anomalies: "Anomalías" }
  },
  en: {
    nav: { overview: "Overview", statistics: "Statistics", claims: "Claims", customers: "Customers", analytics: "Diagnostics", settings: "Settings", history: "History" },
    summary: { cost: "Total Cost", records: "Records", risk: "Claim Ratio", efficiency: "Efficiency", analyzed: "Analyzed", rows: "Rows", kpi: "KPI", high: "High" },
    overview: { title: "Comparative Analysis", subtitle: "Average Cost Comparison by Brand.", anomalies_title: "Anomalies & Data", expensive_brand: "Expensive Brand", frequent_brand: "Most Frequent", tip: "Tip:", tip_desc: "Hover over points for details.", no_anomalies: "No anomalies found.", unknown: "Unk.", na: "N/A" },
    statistics: { title: "Costs by Brand", retention_dist: "Retention Distribution", cost_dist: "Cost Distribution", no_data: "No data", temporal_trends: "Temporal Trends", no_temporal_data: "No temporal data", frequency_heatmap: "Frequency by Brand and Month", no_heatmap_data: "No data for heatmap" },
    claims: { title: "Data Breakdown", categories: "Categories", brand: "Brand", claims: "Claims", avg_cost: "Avg Cost", retention: "Retention", frequent_model: "Frequent Model", estimated_repair: "Est. Repair", no_anomalies_detected: "No anomalies detected." },
    customers: { retention_detected: "Retention Detected", max_cost: "Max Cost", max_value_detected: "Highest value detected." },
    analytics: { title: "Anomalies", subtitle: "Values out of range", summary_title: "File Summary", structure: "Structure", distribution: "Distribution", structure_desc: (rows: number, groups: number) => `Analyzed ${rows} rows. Identified ${groups} unique groups (brands/models).`, distribution_desc: (avg: string) => `Global average cost is €${avg}.` },
    settings: { title: "Settings", subtitle: "Customize your experience.", language: "Language", theme: "Theme", dark: "Dark", light: "Light", auto: "Auto", blue: "Blue", purple: "Purple", green: "Green", highContrastLight: "High Contrast (Light)", highContrastDark: "High Contrast (Dark)", privateMode: "Private Mode", privateModeDesc: "Don't save file history" },
    history: { title: "File History", empty: "No files in history", records: "Records", total_cost: "Total Cost", size: "Size", load: "Load analysis", clear_all: "Clear all" },
    upload: { title: "Upload Data", subtitle: "Drag your CSV, JSON or TXT. Auto analysis of costs and brands.", button: "Select File" },
    status: { analyzing: "Analyzing...", patterns: "Identifying patterns", error_title: "Analysis Error", error_desc: "Could not extract valid data.", retry: "Retry", file: "File" },
    dashboard: { edit_mode: "Edit Mode", view_mode: "View Mode", configure: "Configure Dashboard", configure_title: "Configure Dashboard", layout_name: "Layout Name", current_widgets: "Current Widgets", add_widgets: "Add Widgets", saved_layouts: "Saved Layouts", no_saved_layouts: "No saved layouts", load: "Load", cancel: "Cancel", save: "Save Configuration", placeholder: "My Custom Dashboard", general_summary: "General Summary", brand_comparison: "Brand Comparison", cost_distribution: "Cost Distribution", retention: "Retention", temporal_trends: "Temporal Trends", frequency_heatmap: "Frequency by Brand and Month", metrics_table: "Metrics Table", anomalies: "Anomalies" }
  },
  de: {
    nav: { overview: "Übersicht", statistics: "Statistik", claims: "Schäden", customers: "Kunden", analytics: "Diagnose", settings: "Einstellungen", history: "Verlauf" },
    summary: { cost: "Gesamtkosten", records: "Datensätze", risk: "Schadenquote", efficiency: "Effizienz", analyzed: "Analysiert", rows: "Zeilen", kpi: "KPI", high: "Hoch" },
    overview: { title: "Vergleichsanalyse", subtitle: "Durchschnittskostenvergleich nach Marke.", anomalies_title: "Anomalien & Daten", expensive_brand: "Teure Marke", frequent_brand: "Häufigste", tip: "Tipp:", tip_desc: "Fahren Sie über die Punkte für Details.", no_anomalies: "Keine Anomalien gefunden.", unknown: "Unbek.", na: "N/V" },
    statistics: { title: "Kosten nach Marke", retention_dist: "Verbleibsverteilung", cost_dist: "Kostenverteilung", no_data: "Keine Daten", temporal_trends: "Zeitliche Trends", no_temporal_data: "Keine zeitlichen Daten", frequency_heatmap: "Häufigkeit nach Marke und Monat", no_heatmap_data: "Keine Daten für Heatmap" },
    claims: { title: "Datenaufschlüsselung", categories: "Kategorien", brand: "Marke", claims: "Schäden", avg_cost: "Ø Kosten", retention: "Bindung", frequent_model: "Häufiges Modell", estimated_repair: "Geschätzte Rep.", no_anomalies_detected: "Keine Anomalien erkannt." },
    customers: { retention_detected: "Erkannte Bindung", max_cost: "Max. Kosten", max_value_detected: "Höchster erkannter Wert." },
    analytics: { title: "Anomalien", subtitle: "Werte außerhalb des Bereichs", summary_title: "Dateizusammenfassung", structure: "Struktur", distribution: "Verteilung", structure_desc: (rows: number, groups: number) => `${rows} Zeilen analysiert. ${groups} einzigartige Gruppen (Marken/Modelle) identifiziert.`, distribution_desc: (avg: string) => `Der globale Durchschnittskostenwert beträgt €${avg}.` },
    settings: { title: "Einstellungen", subtitle: "Passen Sie Ihre Erfahrung an.", language: "Sprache", theme: "Thema", dark: "Dunkel", light: "Hell", auto: "Automatisch", blue: "Blau", purple: "Lila", green: "Grün", highContrastLight: "Hoher Kontrast (Hell)", highContrastDark: "Hoher Kontrast (Dunkel)", privateMode: "Privater Modus", privateModeDesc: "Kein Dateiverlauf speichern" },
    history: { title: "Dateiverlauf", empty: "Keine Dateien im Verlauf", records: "Datensätze", total_cost: "Gesamtkosten", size: "Größe", load: "Analyse laden", clear_all: "Alle löschen" },
    upload: { title: "Daten hochladen", subtitle: "Ziehen Sie Ihre CSV, JSON oder TXT. Auto-Analyse von Kosten und Marken.", button: "Datei auswählen" },
    status: { analyzing: "Analysieren...", patterns: "Muster erkennen", error_title: "Analysefehler", error_desc: "Konnte keine gültigen Daten extrahieren.", retry: "Wiederholen", file: "Datei" },
    dashboard: { edit_mode: "Bearbeitungsmodus", view_mode: "Ansichtsmodus", configure: "Dashboard Konfigurieren", configure_title: "Dashboard Konfigurieren", layout_name: "Layout-Name", current_widgets: "Aktuelle Widgets", add_widgets: "Widgets Hinzufügen", saved_layouts: "Gespeicherte Layouts", no_saved_layouts: "Keine gespeicherten Layouts", load: "Laden", cancel: "Abbrechen", save: "Konfiguration Speichern", placeholder: "Mein Benutzerdefiniertes Dashboard", general_summary: "Allgemeine Zusammenfassung", brand_comparison: "Markenvergleich", cost_distribution: "Kostenverteilung", retention: "Bindung", temporal_trends: "Zeitliche Trends", frequency_heatmap: "Häufigkeit nach Marke und Monat", metrics_table: "Metrik-Tabelle", anomalies: "Anomalien" }
  }
};

const initialData: DashboardData = {
  summary: {
    totalRevenue: 0,
    activePolicies: 0,
    claimRatio: 0,
    customerSatisfaction: 0,
  },
  charts: {
    radarData: [],
    retentionData: [],
    claimsData: [],
    timelineData: [],
    trendData: [],
    costDistribution: [],
    heatmapData: []
  },
  anomalies: [],
  topBrands: []
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<DashboardData>(initialData);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [fileName, setFileName] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [lang, setLang] = useState<Language>('de');
  const [theme, setTheme] = useState<Theme>('light');

  // Dashboard customization states
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(loadCurrentLayout());
  const [savedLayouts, setSavedLayouts] = useState<DashboardLayout[]>(loadLayouts());
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = getCurrentSession();
    if (existingSession) {
      setSession(existingSession);
      setLang(existingSession.settings.language);
      setTheme(existingSession.settings.theme);
    }
  }, []);

  const { history, addToHistory, removeFromHistory, clearHistory } = useFileHistory({
    privateMode: session?.settings.privateMode || false,
    userId: session?.userId
  });
  const t = translations[lang];

  // Apply theme to document root
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Watch for system theme changes when theme is 'auto'
  useEffect(() => {
    if (theme === 'auto') {
      const cleanup = watchSystemTheme((systemTheme) => {
        applyTheme('auto'); // Re-apply to pick up the new system theme
      });
      return cleanup;
    }
  }, [theme]);

  // Avisa a Tauri que el frontend está listo
  useEffect(() => {
    emit('react-ready');
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus(AnalysisStatus.PROCESSING);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const result = await processFileLocally(text, file.name, lang);
        setData(result);
        setStatus(AnalysisStatus.COMPLETE);

        // Add to history
        const historyEntry: FileHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          timestamp: Date.now(),
          fileSize: file.size,
          recordCount: result.summary.activePolicies,
          totalCost: result.summary.totalRevenue,
          data: result
        };
        addToHistory(historyEntry);
      } catch (error) {
        setStatus(AnalysisStatus.ERROR);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadFromHistory = (entry: FileHistoryEntry) => {
    setData(entry.data);
    setFileName(entry.fileName);
    setStatus(AnalysisStatus.COMPLETE);
    setCurrentView('overview');
  };

  const handleAuthSuccess = (newSession: Session) => {
    setSession(newSession);
    setLang(newSession.settings.language);
    setTheme(newSession.settings.theme);
  };

  const handleLogout = () => {
    logoutService();
    setSession(null);
    setData(initialData);
    setStatus(AnalysisStatus.IDLE);
    setFileName("");
    setCurrentView('overview');
  };

  const handleSettingsUpdate = (newLang: Language, newTheme: Theme, privateMode: boolean) => {
    if (session) {
      const newSettings = {
        language: newLang,
        theme: newTheme,
        privateMode
      };

      updateUserSettings(session.userId, newSettings);
      setSession({ ...session, settings: newSettings });
      setLang(newLang);
      setTheme(newTheme);
    }
  };

  // Dashboard customization handlers
  const handleLayoutChange = (newLayout: RGLLayout) => {
    setCurrentLayout(prev => ({
      ...prev,
      layout: [...newLayout] as LayoutItem[]
    }));
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Save on exit using current state directly
      saveCurrentLayout(currentLayout);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveLayout = (layout: DashboardLayout) => {
    saveLayout(layout);
    setSavedLayouts(loadLayouts());
    setCurrentLayout(layout);
    setIsConfigOpen(false);
  };

  const handleLoadLayout = (layoutId: string) => {
    const layout = loadLayoutById(layoutId);
    if (layout) {
      setCurrentLayout(layout);
      saveCurrentLayout(layout);
      setIsConfigOpen(false);
    }
  };

  const handleDeleteLayout = (layoutId: string) => {
    deleteLayout(layoutId);
    setSavedLayouts(loadLayouts());
  };

  const handleUpdateWidgets = (widgets: WidgetConfig[]) => {
    const updatedLayout = {
      ...currentLayout,
      widgets
    };
    setCurrentLayout(updatedLayout);
  };

  const mostFrequentBrand = React.useMemo(() => {
    return [...data.topBrands].sort((a, b) => b.claimCount - a.claimCount)[0];
  }, [data.topBrands]);

  const ViewOverview = () => (
    <div className="h-full flex flex-col gap-2 animate-in fade-in duration-500 overflow-hidden relative">
      {/* Dashboard controls */}
      <div className="flex items-center justify-end gap-2 flex-shrink-0 px-2">
        <button
          onClick={toggleEditMode}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
            isEditMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          {isEditMode ? t.dashboard.view_mode : t.dashboard.edit_mode}
        </button>
        <button
          onClick={() => setIsConfigOpen(true)}
          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2"
        >
          <Settings2 size={14} />
          {t.dashboard.configure}
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-auto">
        <DashboardGrid
          data={data}
          theme={theme}
          layout={currentLayout.layout}
          widgets={currentLayout.widgets}
          onLayoutChange={handleLayoutChange}
          lang={lang}
          t={t}
          editable={isEditMode}
        />
      </div>

      {/* Dashboard Config Modal */}
      <DashboardConfig
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentLayout={currentLayout}
        savedLayouts={savedLayouts}
        onSaveLayout={handleSaveLayout}
        onLoadLayout={handleLoadLayout}
        onDeleteLayout={handleDeleteLayout}
        onUpdateWidgets={handleUpdateWidgets}
        lang={lang}
      />
    </div>
  );

  const ViewStatistics = () => (
    <div className="h-full flex flex-col gap-3 animate-in slide-in-from-right-8 duration-500 pb-2 min-h-0 overflow-hidden">
        {/* Top row: Radar, Pie Chart, and Retention */}
        <div className="grid grid-cols-12 gap-3 flex-shrink-0" style={{height: '40%'}}>
            <div className="col-span-4 bg-white dark:bg-slate-800 p-3 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">{t.statistics.title}</h3>
                <div className="flex-1 min-h-0 relative w-full">
                    <MainRadarChart data={data.charts.radarData} theme={theme} />
                </div>
            </div>
            <div className="col-span-4 bg-white dark:bg-slate-800 p-3 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">{t.statistics.cost_dist}</h3>
                <div className="flex-1 min-h-0 relative w-full">
                    {data.charts.costDistribution.length > 0 ? (
                        <CostPieChart data={data.charts.costDistribution} theme={theme} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">{t.statistics.no_data}</div>
                    )}
                </div>
            </div>
            <div className="col-span-4 bg-white dark:bg-slate-800 p-3 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">{t.statistics.retention_dist}</h3>
                <div className="flex-1 min-h-0 relative">
                    <SimpleBarChart data={data.charts.retentionData} color="#3b82f6" theme={theme} />
                </div>
            </div>
        </div>

        {/* Middle row: Line Chart for Trends */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-3 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden" style={{height: '30%'}}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">{t.statistics.temporal_trends}</h3>
            <div className="flex-1 min-h-0 relative">
                {data.charts.trendData.length > 0 ? (
                    <TrendLineChart data={data.charts.trendData} theme={theme} />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">{t.statistics.no_temporal_data}</div>
                )}
            </div>
        </div>

        {/* Bottom row: Heatmap */}
        <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">{t.statistics.frequency_heatmap}</h3>
            <div className="flex-1 min-h-0 relative overflow-auto custom-scrollbar">
                {data.charts.heatmapData.length > 0 ? (
                    <BrandMonthHeatmap data={data.charts.heatmapData} theme={theme} />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">{t.statistics.no_heatmap_data}</div>
                )}
            </div>
        </div>
    </div>
  );

  const ViewClaims = () => (
    <div className="h-full flex flex-col gap-3 animate-in slide-in-from-right-8 duration-500 pb-2 min-h-0">
        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0">
             <div className="flex justify-between items-center mb-3 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.claims.title}</h3>
                <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full uppercase tracking-wide">
                    {data.topBrands.length} {t.claims.categories}
                </span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                 <MetricsTable data={data.topBrands} theme={theme} t={t} />
             </div>
        </div>
    </div>
  );

  const ViewCustomers = () => (
      <div className="h-full grid grid-cols-3 gap-3 animate-in slide-in-from-right-8 duration-500 pb-2 min-h-0 overflow-hidden">
          <div className="col-span-2 bg-white dark:bg-slate-800 p-4 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden h-full">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex-shrink-0">{t.customers.retention_detected}</h3>
              <div className="flex-1 min-h-0 relative">
                  <SimpleBarChart data={data.charts.retentionData} color="#10b981" theme={theme} />
              </div>
          </div>
          <div className="flex flex-col gap-3 h-full min-h-0 overflow-hidden">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-5 rounded-[1.2rem] text-white shadow-xl flex-1 flex flex-col justify-center min-h-0">
                  <div className="mb-3 bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center">
                      <Target className="text-white" size={20} />
                  </div>
                  <h4 className="text-slate-300 font-medium text-xs mb-1 uppercase tracking-wider">{t.customers.max_cost}</h4>
                  <h2 className="text-2xl font-bold mb-1">€{Math.max(...data.topBrands.map(b => b.avgCost), 0).toFixed(0)}</h2>
                  <p className="text-[10px] text-slate-400">{t.customers.max_value_detected}</p>
              </div>
          </div>
      </div>
  );

  const ViewAnalytics = () => (
      <div className="h-full grid grid-cols-2 gap-3 animate-in slide-in-from-right-8 duration-500 pb-2 min-h-0 overflow-hidden">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden h-full">
                <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                    <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.analytics.title}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.analytics.subtitle}</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                   <AnomalyList anomalies={data.anomalies} lang={lang} />
                </div>
           </div>

           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[1.2rem] border border-slate-100 dark:border-slate-700 flex flex-col min-h-0 overflow-hidden h-full">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex-shrink-0">{t.analytics.summary_title}</h3>
               <div className="space-y-3 overflow-auto custom-scrollbar pr-2 flex-1">
                   <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100/50 dark:border-slate-700">
                       <p className="text-slate-800 dark:text-slate-200 text-xs font-bold mb-1 uppercase tracking-wide">{t.analytics.structure}</p>
                       <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                           {t.analytics.structure_desc(data.summary.activePolicies, data.topBrands.length)}
                       </p>
                   </div>
                   <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100/50 dark:border-slate-700">
                       <p className="text-slate-800 dark:text-slate-200 text-xs font-bold mb-1 uppercase tracking-wide">{t.analytics.distribution}</p>
                       <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                           {t.analytics.distribution_desc((data.summary.totalRevenue / (data.summary.activePolicies || 1)).toFixed(2))}
                       </p>
                   </div>
               </div>
           </div>
      </div>
  );

  const ViewSettings = () => {
    const handleLangChange = (newLang: Language) => {
      setLang(newLang);
      if (session) {
        handleSettingsUpdate(newLang, theme, session.settings.privateMode);
      }
    };

    const handleThemeChange = (newTheme: Theme) => {
      setTheme(newTheme);
      if (session) {
        handleSettingsUpdate(lang, newTheme, session.settings.privateMode);
      }
    };

    const handlePrivateModeToggle = () => {
      if (session) {
        const newPrivateMode = !session.settings.privateMode;
        handleSettingsUpdate(lang, theme, newPrivateMode);
      }
    };

    return (
      <div className="h-full flex flex-col items-center justify-center animate-in slide-in-from-right-8 duration-500">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400 dark:text-slate-500">
              <Zap size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.settings.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs text-center mb-8">
              {t.settings.subtitle}
          </p>

          <div className="w-full max-w-sm space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 block">{t.settings.language}</label>
                  <div className="flex gap-2">
                      <button onClick={() => handleLangChange('es')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${lang === 'es' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Español</button>
                      <button onClick={() => handleLangChange('en')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>English</button>
                      <button onClick={() => handleLangChange('de')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${lang === 'de' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Deutsch</button>
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 block">{t.settings.theme}</label>
                  <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${theme === 'light' ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                      >
                          <Sun size={16} /> {t.settings.light}
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                      >
                          <Moon size={16} /> {t.settings.dark}
                      </button>
                      <button
                        onClick={() => handleThemeChange('auto')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${theme === 'auto' ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                      >
                          <Globe size={16} /> {t.settings.auto}
                      </button>
                      <button
                        onClick={() => handleThemeChange('blue')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${theme === 'blue' ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300' : 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30'}`}
                      >
                          <Droplet size={16} /> {t.settings.blue}
                      </button>
                      <button
                        onClick={() => handleThemeChange('purple')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${theme === 'purple' ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}
                      >
                          <Circle size={16} /> {t.settings.purple}
                      </button>
                      <button
                        onClick={() => handleThemeChange('green')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${theme === 'green' ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-300' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'}`}
                      >
                          <Leaf size={16} /> {t.settings.green}
                      </button>
                      <button
                        onClick={() => handleThemeChange('high-contrast-light')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 col-span-2 ${theme === 'high-contrast-light' ? 'bg-black text-white shadow-lg ring-2 ring-gray-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-900 dark:border-gray-100'}`}
                      >
                          <Sun size={16} /> {t.settings.highContrastLight}
                      </button>
                      <button
                        onClick={() => handleThemeChange('high-contrast-dark')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg transition-all flex items-center gap-2 col-span-2 ${theme === 'high-contrast-dark' ? 'bg-white text-black shadow-lg ring-2 ring-gray-400' : 'bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-gray-100 dark:border-gray-900'}`}
                      >
                          <Moon size={16} /> {t.settings.highContrastDark}
                      </button>
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">{t.settings.privateMode}</label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">{t.settings.privateModeDesc}</p>
                  <button
                    onClick={handlePrivateModeToggle}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      session?.settings.privateMode
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {session?.settings.privateMode ? '🔒 Activado' : '🔓 Desactivado'}
                  </button>
              </div>
          </div>
      </div>
    );
  };

  const ViewHistory = () => (
    <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-500 pb-2">
      <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-[1.2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
        <FileHistory
          history={history}
          onLoadFile={handleLoadFromHistory}
          onRemoveFile={removeFromHistory}
          onClearHistory={clearHistory}
          lang={lang}
          t={t}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    if (currentView === 'settings') {
        return <ViewSettings />;
    }

    if (currentView === 'history') {
        return <ViewHistory />;
    }

    if (status === AnalysisStatus.IDLE) {
      return (
        <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-500">
            <div className="p-10 border-2 border-dashed border-blue-200 dark:border-blue-900/40 bg-white dark:bg-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-all shadow-sm max-w-xl w-full mx-4">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center shadow-inner mb-5">
                <UploadCloud className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.upload.title}</h2>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mb-6 leading-relaxed">
                {t.upload.subtitle}
              </p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2 text-sm">
                <FileSpreadsheet size={18} />
                <span>{t.upload.button}</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv,.txt,.json,.log,.dat" />
              </label>
            </div>
        </div>
      );
    }

    if (status === AnalysisStatus.PROCESSING) {
      return (
         <div className="flex flex-col items-center justify-center h-full">
           <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 w-12 h-12 mb-4" />
           <p className="text-lg font-bold text-slate-800 dark:text-white">{t.status.analyzing}</p>
           <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{t.status.patterns}</p>
         </div>
      );
    }

    if (status === AnalysisStatus.ERROR) {
       return (
         <div className="flex flex-col items-center justify-center h-full">
             <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 text-center max-w-sm">
               <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-3" />
               <p className="text-red-700 dark:text-red-300 font-bold text-base mb-1">{t.status.error_title}</p>
               <p className="text-red-500 dark:text-red-400 text-xs mb-4">{t.status.error_desc}</p>
               <button onClick={() => setStatus(AnalysisStatus.IDLE)} className="px-5 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-lg font-bold shadow-sm text-xs hover:shadow-md transition-shadow">{t.status.retry}</button>
             </div>
         </div>
       );
    }

    switch (currentView) {
        case 'overview': return <ViewOverview />;
        case 'statistics': return <ViewStatistics />;
        case 'claims': return <ViewClaims />;
        case 'customers': return <ViewCustomers />;
        case 'analytics': return <ViewAnalytics />;
        default: return <ViewOverview />;
    }
  };

  // Show auth screen if not logged in
  if (!session) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} defaultLang={lang} defaultTheme={theme} />;
  }

  return (
    <div className="h-screen overflow-hidden">
        <div className="flex h-screen bg-background font-sans overflow-hidden text-foreground selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} lang={lang} onReset={handleLogout} />
          
          <main className="flex-1 flex flex-col p-4 lg:p-6 h-screen overflow-hidden max-w-[1920px] mx-auto w-full transition-colors duration-300">
            <header className="flex justify-between items-center mb-4 flex-shrink-0 h-12">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.nav[currentView]}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">
                    {fileName ? `${t.status.file}: ${fileName}` : 'WertGarantie Intelligence'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 relative transition-colors border border-slate-100 dark:border-slate-700">
                  <Bell size={18} className="text-slate-600 dark:text-slate-400" />
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                </button>
                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-lg shadow-slate-200 dark:shadow-none text-sm tracking-wide">
                  WG
                </div>
              </div>
            </header>

            <div className="flex-1 min-h-0 relative w-full">
                {renderContent()}
            </div>

          </main>
        </div>
    </div>
  );
}