import { InjectionToken } from '@angular/core';

import type { LineChartOptions } from '../../data/chart-data';

/** Draws a chart into an element and resolves to what disposes of it. */
export type LineChartDrawer = (host: HTMLElement, options: LineChartOptions) => Promise<() => void>;

/**
 * How `tamu-gisc-line-chart` draws. The default loads amCharts on first use. Tests provide their own, because amCharts
 * draws on a canvas, which a test's DOM does not have.
 */
export const LINE_CHART_DRAWER = new InjectionToken<LineChartDrawer>('LINE_CHART_DRAWER', {
  providedIn: 'root',
  factory: () => (host, options) => import('./draw-line-chart').then((m) => m.drawLineChart(host, options))
});
