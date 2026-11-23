# ui-kits-ngx-charts

Charts for the Angular apps, drawn with [amCharts 5](https://www.amcharts.com/docs/v5/) (#2886).

- `tamu-gisc-line-chart`: one or more series of dated points, a fixed height (`[height]`, default 320 px) that does not
  grow with the page, values on hover, drag-to-zoom (double-click or the zoom-out button shows it all again), and a
  legend when there is more than one series.
  - `[steps]="true"` draws each line as steps, which suits a running total.
  - `[bars]` draws a series as pale columns in a short panel under the lines, on their own scale.
  - `[bands]` shades stretches of time, each with a label.
  - `[unit]` names what the values count, for the hover text.
- `runningTotalByDay(times)`, `countsByDay(times)` and `bandOfDays(times, label)`: a list of times as a running total,
  as each day's count, and as the band of days they cover. Each day is placed at midnight UTC of its calendar day in
  the time zone given (Central by default), and the chart reads dates in UTC, so a point is labelled as the day it is.

**amCharts is loaded only when a chart is drawn**: `LINE_CHART_DRAWER` imports `draw-line-chart.ts`, which imports
amCharts, on first use, so a page with no chart does not carry it. Tests provide their own `LINE_CHART_DRAWER`,
because amCharts draws on a canvas, which a test's DOM does not have.

**The amCharts logo stays.** amCharts is used under its free linkware licence, which requires the small amCharts link
on every chart. It is also the version `@arcgis/core` depends on (`~5.18.0`), so the two move together.

The first version (#2878) drew SVG by hand. It scaled with the page, so its text and markers grew to several times the
page's size on a wide screen, and it showed no values on hover.

Run `nx test ui-kits-ngx-charts` to execute the unit tests.
