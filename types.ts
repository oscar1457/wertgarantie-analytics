export interface ChartDataPoint {
  name: string;
  value: number;
  fullMark?: number;
  [key: string]: string | number | undefined;
}

export interface MetricDetail {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  description?: string;
}

export interface Anomaly {
  id: string;
  item: string;
  cost: number;
  reason: string;
}

export interface BrandStat {
  brand: string;
  avgCost: number;
  claimCount: number;
  retentionRate: number;
}

export interface InsightDetail {
  metric: string;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
  question: string;
  answer: string;
}

export interface TimelineDataPoint {
  month: string;
  cost: number;
  claims: number;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

export interface HeatmapDataPoint {
  brand: string;
  month: string;
  frequency: number;
}

export interface DashboardData {
  summary: {
    totalRevenue: number;
    activePolicies: number;
    claimRatio: number;
    customerSatisfaction: number;
  };
  charts: {
    radarData: ChartDataPoint[]; // Brands comparison
    retentionData: ChartDataPoint[];
    claimsData: ChartDataPoint[];
    timelineData: number[];
    trendData: TimelineDataPoint[]; // Time series for line chart
    costDistribution: PieChartDataPoint[]; // Pie chart data
    heatmapData: HeatmapDataPoint[]; // Heatmap data
  };
  anomalies: Anomaly[];
  topBrands: BrandStat[];
}

export enum AnalysisStatus {
  IDLE,
  PROCESSING,
  COMPLETE,
  ERROR
}

export type ViewState = 'overview' | 'statistics' | 'claims' | 'customers' | 'analytics' | 'settings' | 'history';

export type Language = 'es' | 'en' | 'de';
export type Theme = 'light' | 'dark' | 'auto' | 'blue' | 'purple' | 'green' | 'high-contrast-light' | 'high-contrast-dark';

export interface FileHistoryEntry {
  id: string;
  fileName: string;
  timestamp: number;
  fileSize?: number;
  recordCount: number;
  totalCost: number;
  data: DashboardData;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  settings: UserSettings;
}

export interface UserSettings {
  language: Language;
  theme: Theme;
  privateMode: boolean;
}

export interface Session {
  userId: string;
  username: string;
  isAuthenticated: boolean;
  settings: UserSettings;
}

export type WidgetType =
  | 'radar'
  | 'pie'
  | 'retention'
  | 'line'
  | 'heatmap'
  | 'metrics'
  | 'anomalies'
  | 'summary';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  layout: LayoutItem[];
  widgets: WidgetConfig[];
}
