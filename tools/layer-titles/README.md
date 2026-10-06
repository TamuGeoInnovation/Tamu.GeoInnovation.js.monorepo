# Layer titles: ours against the publisher's

A layer's name belongs to whoever publishes the service. A `title` in a definitions file overrides
that, so this tool asks every service what it calls each layer and reports where the two disagree.

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/<checkout>:/repo" -w /repo node:22.23.3 \
  node tools/layer-titles/compare.mjs
```

| Flag | What it does |
| --- | --- |
| *(none)* | Reports the counts and lists every title that differs |
| `--markdown` | The table for the upstream issue, so Transportation can work through it |
| `--drop-identical` | Removes the titles that restate the service's name exactly |

## Why the identical ones are safe to drop

`title` is passed straight into the `FeatureLayer` constructor. Left out, Esri fills it from the
service on load, so removing a title that already matches changes nothing on screen.

## Why the rest are not

Three kinds of difference, found on 6 October 2026 (#1508):

- **The service name is wrong for how the map uses the layer.** The graduation maps draw road
  closures from a service layer named `Event Parking`. Dropping that title mislabels the layer.
- **Two filtered entries from one service layer.** `business-parking`, `contractor-parking` and
  `freshman-parking` each split one layer in two by `definitionExpression`, and only our titles tell
  them apart. Dropping both leaves the same name twice in the list.
- **Cosmetic.** Casing, a plural, a trailing space. The service's is as good or better and these
  come out as the names are confirmed upstream.

Re-run it as Transportation renames layers: each one that matches becomes one more title to delete.
