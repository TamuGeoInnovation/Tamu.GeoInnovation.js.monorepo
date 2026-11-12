# ui-kits-ngx-charts

Charts drawn as SVG, with no chart library, so a page that needs one chart does not pull in a dependency.

- `tamu-gisc-line-chart`: one or more series of dated points, on a round scale from zero, with a legend when there
  is more than one. `[steps]="true"` draws each line as steps, which suits a running total.
- `runningTotalByDay(times, timeZone)`: the points of a running total, one per day, from a list of times.

First used for GIS Day's RSVPs over time (#2878).

Run `nx test ui-kits-ngx-charts` to execute the unit tests.
