# Knowing when a map has finished

A map takes tens of seconds to load and then keeps drawing after it says it is loaded. Almost every
flaky map test, and every half-drawn screenshot, comes from asking the wrong one of those two
questions.

This page says which signal answers which question. It exists because the capture tool in
`tools/visual-baselines` was written twice against the wrong one and produced a 45% "difference"
between two builds that was really one side photographed before its basemap had drawn.

## The two questions

| You want to | Wait for | Means |
| --- | --- | --- |
| Read layer state — loaded, errored, feature counts | `probe.ready` | Every layer has settled, successfully or not |
| **Capture the canvas** — a screenshot, a pixel assertion | `probe.drawing === false` | The view has stopped fetching and painting |

They are not the same and they do not happen at the same time. From the probe's own documentation,
measured against a local build:

> layers settle around six seconds in and drawing finishes around twenty

So a test that screenshots on `ready` photographs a map that is **fourteen seconds** from finished.

`probe.drawing` is `MapView.updating`. It was observed to flip exactly twice per load across repeated
runs and different maps, so it is safe to poll rather than something that thrashes.

## The signals, and what each is for

### `window.__tamuGiscMapProbe.ready`

Every layer has finished loading, successfully or not, and the framing is readable. **This is the
signal to poll before reading layer state** — which layers failed, how many features they serve.
Esri takes tens of seconds to get here on a cold load.

Not a drawing signal.

### `window.__tamuGiscMapProbe.drawing`

Whether the view is still fetching or painting. **Anything that captures the canvas has to wait for
this to be `false`**, or it records a half-drawn map.

### `window.__tamuGiscMapProbe.snapshot()`

Layer-by-layer state: id, title, type, visible, loaded, error, featureCount, spatialReference,
drawable. What the layer assertions in `maps.spec.ts` read once `ready`.

`spatialReference` paired with each layer's is how a test sees a map that loads everything and draws
nothing — a tiled basemap in a view of another reference is invisible, because Esri cannot reproject
it. Every event and parking map failed exactly that way once and the suite passed them (#1240, #1241).

### `waitForPaint` — `test/smoke/aggiemap/paint.ts`

Samples the Esri view surface and requires the canvas to stay below the blank threshold for several
**consecutive** readings. Used by four specs.

This is the strongest check and the one to use when the question is "did this map actually draw
something". It catches two different failures that `drawing` alone does not: a map that never paints,
and a map that paints and then empties. Its failure message distinguishes them.

Note what it costs: it is the check that fails under load, because the heaviest maps paint but do not
hold steady for three consecutive readings inside the window (#1512).

### `waitForSettledFraming` — `test/smoke/aggiemap/framing.ts`

Where the view ended up, once it has stopped moving. For asserting zoom and centre, which is its own
question again — a map can be fully drawn and looking at the wrong place.

### `viewReady`

**Diagnostics only. Do not gate on it.** A view only becomes ready once it is attached to a sized,
visible container, so it stays false in a hidden or zero-height pane even when every layer has loaded
perfectly. That is an observed case, not a hypothetical. Gating on it turns a rendering concern into
spurious layer failures.

## Choosing

```
Reading layer state?            await probe.ready
Taking a screenshot?            await probe.ready, then probe.drawing === false
Asserting the map drew?         waitForPaint()
Asserting where it is looking?  waitForSettledFraming()
Nothing to do with a map?       none of the above - a page with no probe needs no wait
```

A fixed `waitForTimeout` is not on that list. It is what both failed versions of the capture tool
used, and the length that works on an idle machine is not the length that works while a suite is
running — which is the same reason the release gate disagrees with itself under load (#1512).

## If you are capturing images

- Wait for `ready`, then `drawing === false`. Both.
- Leave a short tail afterwards for anything that dismisses itself. The map notices clear after about
  ten seconds; outlasting them keeps the space they occupied in the comparison, where hiding them
  would not.
- Expect map captures **not** to be byte-reproducible. Three captures of one unchanged map page give
  three different hashes; the canvas is not deterministic. Compare with a pixel tolerance - the visual
  config already sets `maxDiffPixelRatio: 0.01` - and never by hash (#1105). Pages without a map are
  stable and can be hashed.
- Capture both sides of a comparison under the same conditions. A before taken on an idle machine and
  an after taken during a build differ for reasons that have nothing to do with the code.
