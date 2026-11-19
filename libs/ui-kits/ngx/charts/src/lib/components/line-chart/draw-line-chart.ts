import { anchorTicks, daysFrom, everyDay, LineChartOptions, relativeDayLabel } from '../../data/chart-data';

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

  // The axis spans the data and every band, so a band still to come, such as next week's event, is shown. A point
  // stands for its whole day, so the data's span ends at the end of its last day, or that day falls off the edge.
  const DAY = 24 * 60 * 60 * 1000;
  const pointTimes = [...options.series.flatMap((s) => s.points), ...(options.bars?.points ?? [])].map((p) => p.x.getTime());
  const times = [
    ...pointTimes,
    ...(pointTimes.length ? [Math.max(...pointTimes) + DAY] : []),
    ...options.bands.flatMap((b) => [b.from.getTime(), b.to.getTime()])
  ];
  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      min: Math.min(...times),
      max: Math.max(...times),
      strictMinMax: true,
      baseInterval: { timeUnit: 'day', count: 1 },
      gridIntervals: [
        { timeUnit: 'day', count: 1 },
        { timeUnit: 'week', count: 1 },
        { timeUnit: 'month', count: 1 }
      ],
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 55 }),
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

  // Counted from an anchor (#3215), the axis reads in days before and after it, and its hover in that day too, since
  // the lines of other seasons fall on other dates. Its own grid and labels are replaced by ticks counted out from the
  // anchor, so 0 is always one of them: amCharts groups weeks from its own starting point, which on a narrow chart
  // labelled -35, -21, -7 and left the anchor bare (lab report 136).
  const anchor = options.anchor;

  if (anchor) {
    const renderer = xAxis.get('renderer');
    renderer.labels.template.set('forceHidden', true);
    renderer.grid.template.set('forceHidden', true);

    for (const tick of anchorTicks(anchor, Math.min(...times), Math.max(...times), host.clientWidth || 600)) {
      const range = xAxis.createAxisRange(xAxis.makeDataItem({ value: tick }));
      range.get('grid')?.setAll({ forceHidden: false, strokeOpacity: 0.08, location: 0 });
      range.get('label')?.setAll({ forceHidden: false, text: relativeDayLabel(daysFrom(anchor, new Date(tick))), location: 0, fill: text });
    }

    xAxis.getTooltipText = (position: number) => {
      const day = new Date(xAxis.positionToDate(position).getTime());
      day.setUTCHours(0, 0, 0, 0);
      const n = daysFrom(anchor, day);

      return n === 0 ? 'Day 0' : `${relativeDayLabel(n)} ${Math.abs(n) === 1 ? 'day' : 'days'}`;
    };
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
    // Right-aligned to the band's end, which is often the chart's right edge: an event still to come.
    // forceHidden: false, since the anchor's ticks hide the axis's own labels, which a range's label is made from.
    range.get('label')?.setAll({ forceHidden: false, text: band.label, inside: true, location: 1, centerX: am5.p100, centerY: am5.p100, dx: -4, dy: -6, fill: text, fillOpacity: 0.75 });
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
      // Counted from an anchor, each line's own date, since each season's falls on a different one.
      tooltip: am5.Tooltip.new(root, { labelText: `{name}: [bold]{valueY}[/] ${options.unit}${anchor ? ' ({when})' : ''}` })
    };
    const line = chart.series.push(options.steps ? am5xy.StepLineSeries.new(root, settings) : am5xy.LineSeries.new(root, settings));
    line.strokes.template.set('strokeWidth', 2);
    line.fills.template.setAll({ visible: true, fillOpacity: 0.08 });
    // Every day has a value, so hovering a day nobody RSVP'd still reads the total.
    const shift = (s.shiftDays ?? 0) * DAY;
    line.data.setAll(
      (options.steps ? everyDay(s.points, 'hold') : s.points).map((p) => ({ x: p.x.getTime(), y: p.y, when: dayText(p.x.getTime() - shift) }))
    );

    return line;
  });

  if (options.bars) {
    const bars = options.bars;
    const barAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        maxPrecision: 0,
        height: am5.percent(28),
        marginTop: 28,
        renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 24 })
      })
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
        tooltip: am5.Tooltip.new(root, { labelText: `${bars.label}: [bold]+{valueY}[/]` })
      })
    );
    // At most 18 px wide: with only a few days to chart, a column would otherwise be as wide as its share of the chart.
    columns.columns.template.setAll({ width: am5.percent(70), maxWidth: 18, fillOpacity: 0.35, strokeOpacity: 0, cornerRadiusTL: 2, cornerRadiusTR: 2 });
    columns.data.setAll(everyDay(bars.points, 'zero').map((p) => ({ x: p.x.getTime(), y: p.y })));
  }

  // Drag across the chart to zoom into a period; the zoom-out button or a double-click shows it all again.
  const cursor = chart.set('cursor', am5xy.XYCursor.new(root, { behavior: 'zoomX', xAxis }));
  cursor.lineY.set('visible', false);
  chart.plotContainer.events.on('dblclick', () => chart.zoomOut());
  chart.zoomOutButton.get('background')?.setAll({ fill: am5.color(options.series[0]?.color ?? '#500000') });

  if (lines.length > 1) {
    const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50, marginTop: 8 }));
    legend.data.setAll(lines);
  }

  return () => root.dispose();
}

/** A day at midnight UTC as its calendar day, with its year: "Mon, Nov 17, 2025". */
export function dayText(time: number): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(time));
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
