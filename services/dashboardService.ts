import { DashboardLayout, WidgetConfig, LayoutItem } from '../types';

const STORAGE_KEY = 'wg_dashboard_layouts';
const CURRENT_LAYOUT_KEY = 'wg_current_layout';

// Default layout configuration
export const getDefaultLayout = (): DashboardLayout => {
  return {
    id: 'default',
    name: 'Vista Por Defecto',
    widgets: [
      { id: 'summary-1', type: 'summary', title: 'Resumen General', enabled: true },
      { id: 'radar-1', type: 'radar', title: 'Comparación de Marcas', enabled: true },
      { id: 'pie-1', type: 'pie', title: 'Distribución de Costos', enabled: true },
      { id: 'retention-1', type: 'retention', title: 'Retención', enabled: true },
      { id: 'line-1', type: 'line', title: 'Tendencias Temporales', enabled: true },
      { id: 'heatmap-1', type: 'heatmap', title: 'Frecuencia por Marca y Mes', enabled: true },
    ],
    layout: [
      { i: 'summary-1', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'radar-1', x: 0, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
      { i: 'pie-1', x: 4, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
      { i: 'retention-1', x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
      { i: 'line-1', x: 0, y: 6, w: 12, h: 3, minW: 6, minH: 2 },
      { i: 'heatmap-1', x: 0, y: 9, w: 12, h: 4, minW: 6, minH: 3 },
    ],
  };
};

// Load all saved layouts
export const loadLayouts = (): DashboardLayout[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading layouts:', error);
  }
  return [getDefaultLayout()];
};

// Save layouts to localStorage
export const saveLayouts = (layouts: DashboardLayout[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch (error) {
    console.error('Error saving layouts:', error);
  }
};

// Load current active layout
export const loadCurrentLayout = (): DashboardLayout => {
  try {
    const stored = localStorage.getItem(CURRENT_LAYOUT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading current layout:', error);
  }
  return getDefaultLayout();
};

// Save current active layout
export const saveCurrentLayout = (layout: DashboardLayout): void => {
  try {
    localStorage.setItem(CURRENT_LAYOUT_KEY, JSON.stringify(layout));
  } catch (error) {
    console.error('Error saving current layout:', error);
  }
};

// Add or update a layout
export const saveLayout = (layout: DashboardLayout): void => {
  const layouts = loadLayouts();
  const existingIndex = layouts.findIndex((l) => l.id === layout.id);

  if (existingIndex >= 0) {
    layouts[existingIndex] = layout;
  } else {
    layouts.push(layout);
  }

  saveLayouts(layouts);
  saveCurrentLayout(layout);
};

// Delete a layout
export const deleteLayout = (layoutId: string): void => {
  if (layoutId === 'default') return; // Don't allow deleting default layout

  const layouts = loadLayouts();
  const filtered = layouts.filter((l) => l.id !== layoutId);
  saveLayouts(filtered);

  // If we deleted the current layout, switch to default
  const current = loadCurrentLayout();
  if (current.id === layoutId) {
    saveCurrentLayout(getDefaultLayout());
  }
};

// Load a specific layout by ID
export const loadLayoutById = (layoutId: string): DashboardLayout | null => {
  const layouts = loadLayouts();
  return layouts.find((l) => l.id === layoutId) || null;
};
