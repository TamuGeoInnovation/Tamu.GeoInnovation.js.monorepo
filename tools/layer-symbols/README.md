# Published symbol sizes: declared against actual

A service can declare a picture marker `25x25` while the image it ships is `32x40`. Esri draws the
art squeezed into the declared box — on the map and in the legend swatch — so AggieMap carries
`legend: { width, height }` hints to re-render it at its true ratio.

The hint is a workaround for a value that is wrong at the source. This tool finds every one of them.

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/<checkout>:/repo" -w /repo node:22.23.3 \
  node tools/layer-symbols/compare.mjs
```

| Flag | What it does |
| --- | --- |
| *(none)* | Every mismatch, with the service URL for each |
| `--markdown` | The table for the upstream issue, showing the art at both sizes |
| `--extract <dir>` | Writes each symbol's art as a PNG, so the issue can show it |

`SYMBOL_IMAGE_BASE` sets the URL the markdown table points its images at.

## What it found on 6 October 2026 (#1523)

57 services, 169 layers reachable, **42 picture markers published at a size that does not match
their art**. The worst is Muster's Accessible Parking: a 700x885 PNG declared as 25x25, which is
both stretched and about forty times more image than the marker needs.

It scans every service named in `connections.ts`, not only the ones already worked around, so it
finds the layers nobody has looked at too.

## How it decides

The declared size comes from the renderer's symbol. The real size comes from the PNG's own IHDR
header, which is read from the `imageData` the service publishes — so it is measured, not inferred.
A difference under 0.05 of a ratio point is ignored, which is roughly where a pin starts to look
visibly squashed.
