import type { LineChartOptions } from '../../data/chart-data';

/**
 * Draws the chart into `host` with amCharts 5 and resolves to what disposes of it. amCharts is imported here, and this
 * file is itself imported only when a chart is drawn, so a page without a chart does not load it.
 *
 * Every point sits at midnight UTC of its calendar day (see runningTotalByDay), so the chart reads dates in UTC.
 */
export async function drawLineChart(host: HTMLElement, options: LineChartOptions): Promise<() => void> {
  const [am5, am5xy, { default: Animated }] = await Promise.all([
    import('@amcharts/amcharts5'),
    import('@amcharts/amcharts5/xy'),
    import('@amcharts/amcharts5/themes/Animated')
  ]);

  const root = am5.Root.new(host);
  root.utc = true;
  root.numberFormatter.set('numberFormat', '#,###');

  // The page's own type, at the page's size: amCharts draws on a canvas, which does not inherit CSS.
  const style = getComputedStyle(host);
  const text = am5.color(rgbToHex(style.color) ?? '#3e3e3e');
  const theme = am5.Theme.new(root);
  theme.rule('Label').setAll({ fontFamily: style.fontFamily, fontSize: 13, fill: text });
  theme.rule('Grid').setAll({ strokeOpacity: 0.08 });
  root.setThemes([Animated.new(root), theme]);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      paddingLeft: 0,
      paddingRight: 8,
      layout: root.verticalLayout
    })
  );
  // The lines' panel above, the columns' short panel below.
  chart.leftAxesContainer.set('layout', root.verticalLayout);

  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: 'day', count: 1 },
      gridIntervals: [
        { timeUnit: 'day', count: 1 },
        { timeUnit: 'week', count: 1 },
        { timeUnit: 'month', count: 1 }
      ],
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 70 }),
      tooltip: am5.Tooltip.new(root, {}),
      tooltipDateFormat: 'EEE, MMM d'
    })
  );

  for (const formats of [xAxis.get('dateFormats'), xAxis.get('periodChangeDateFormats')]) {
    if (formats) {
      formats['day'] = 'MMM d';
      formats['week'] = 'MMM d';
    }
  }

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      maxPrecision: 0,
      height: am5.percent(options.bars ? 72 : 100),
      renderer: am5xy.AxisRendererY.new(root, {})
    })
  );

  for (const band of options.bands) {
    const range = xAxis.createAxisRange(xAxis.makeDataItem({ value: band.from.getTime(), endValue: band.to.getTime() }));
    range.get('axisFill')?.setAll({ visible: true, fill: am5.color('#500000'), fillOpacity: 0.07 });
    range.get('grid')?.set('forceHidden', true);
    range.get('label')?.setAll({ text: band.label, inside: true, location: 0.5, centerY: am5.p100, dy: -6, fill: text, fillOpacity: 0.7 });
  }

  const lines = options.series.map((s) => {
    const color = am5.color(s.color);
    const settings = {
      name: s.label,
      xAxis,
      yAxis,
      valueXField: 'x',
      valueYField: 'y',
      stroke: color,
      fill: color,
      tooltip: am5.Tooltip.new(root, { labelText: `{name}: [bold]{valueY}[/] ${options.unit}` })
    };
    const line = chart.series.push(options.steps ? am5xy.StepLineSeries.new(root, settings) : am5xy.LineSeries.new(root, settings));
    line.strokes.template.set('strokeWidth', 2);
    line.fills.template.setAll({ visible: true, fillOpacity: 0.08 });
    line.data.setAll(s.points.map((p) => ({ x: p.x.getTime(), y: p.y })));

    return line;
  });

  if (options.bars) {
    const bars = options.bars;
    const barAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        maxPrecision: 0,
        height: am5.percent(28),
        marginTop: 16,
        renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 24 })
      })
    );
    barAxis.children.unshift(
      am5.Label.new(root, { text: bars.label, rotation: -90, y: am5.p50, centerX: am5.p50, fill: text, fillOpacity: 0.7 })
    );

    const color = am5.color(bars.color);
    const columns = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: bars.label,
        xAxis,
        yAxis: barAxis,
        valueXField: 'x',
        valueYField: 'y',
        fill: color,
        stroke: color,
        tooltip: am5.Tooltip.new(root, { labelText: '+{valueY} that day' })
      })
    );
    columns.columns.template.setAll({ width: am5.percent(70), fillOpacity: 0.35, strokeOpacity: 0, cornerRadiusTL: 2, cornerRadiusTR: 2 });
    columns.data.setAll(bars.points.map((p) => ({ x: p.x.getTime(), y: p.y })));
  }

  // Drag across the chart to zoom into a period; the zoom-out button or a double-click shows it all again.
  const cursor = chart.set('cursor', am5xy.XYCursor.new(root, { behavior: 'zoomX', xAxis }));
  cursor.lineY.set('visible', false);
  chart.plotContainer.events.on('dblclick', () => chart.zoomOut());

  if (lines.length > 1) {
    const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50, marginTop: 8 }));
    legend.data.setAll(lines);
  }

  return () => root.dispose();
}

/** `rgb(r, g, b)` as `#rrggbb`, or null if it is not one. */
export function rgbToHex(css: string): string | null {
  const m = css.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  return m
    ? '#' +
        m
          .slice(1, 4)
          .map((n) => Number(n).toString(16).padStart(2, '0'))
          .join('')
    : null;
}
