# Knowing when a map has finished

A map takes tens of seconds to load and then keeps drawing after it says it is loaded. Almost every
flaky map test, and every half-drawn screenshot, comes from asking the wrong one of those two
questions.

This page says which signal answers which question. It exists because the capture tool in
`tools/visual-baselines` was written twice against the wrong one and produced a 45% "difference"
between two builds that was really one side photographed before its basemap had drawn.

**None of the probe's signals (`ready`, `drawing`, `snapshot()`) can see a blank map.** A map can report `ready`, every layer loaded and every
layer drawable while the canvas is pure white. Only sampling the pixels measures that, and measuring it
when it happens on some loads and not others has its own rules: see
[Measuring a map that is blank only sometimes](#measuring-a-map-that-is-blank-only-sometimes).

## The two questions

| You want to | Wait for | Means |
| --- | --- | --- |
| Read layer state - loaded, errored, feature counts | `probe.ready` | Every layer has settled, successfully or not |
| **Capture the canvas** - a screenshot, a pixel assertion | `probe.drawing === false` | The view has stopped fetching and painting |

They are not the same and they do not happen at the same time. From the probe's own documentation,
measured against a local build:

> layers settle around six seconds in and drawing finishes around twenty

So a test that screenshots on `ready` photographs a map that is **fourteen seconds** from finished.

`probe.drawing` is `MapView.updating`. It was observed to flip exactly twice per load across repeated
runs and different maps, so it is safe to poll rather than something that thrashes.

## The signals, and what each is for

### `window.__tamuGiscMapProbe.ready`

Every layer has finished loading, successfully or not, and the framing is readable. **This is the
signal to poll before reading layer state** - which layers failed, how many features they serve.
Esri takes tens of seconds to get here on a cold load.

Not a drawing signal.

### `window.__tamuGiscMapProbe.drawing`

Whether the view is still fetching or painting. **Anything that captures the canvas has to wait for
this to be `false`**, or it records a half-drawn map.

### `window.__tamuGiscMapProbe.snapshot()`

Layer-by-layer state: id, title, type, visible, loaded, error, featureCount, spatialReference,
drawable. What the layer assertions in `maps.spec.ts` read once `ready`.

`spatialReference` paired with each layer's is how a test sees a map that loads everything and draws
nothing - a tiled basemap in a view of another reference is invisible, because Esri cannot reproject
it. Every event and parking map failed exactly that way once and the suite passed them (#1240, #1241).

### `waitForPaint` - `test/smoke/aggiemap/paint.ts`

Samples the Esri view surface and requires the canvas to stay below the blank threshold for several
**consecutive** readings. Used by four specs.

This is the strongest check and the one to use when the question is "did this map actually draw
something". It catches two different failures that `drawing` alone does not: a map that never paints,
and a map that paints and then empties. Its failure message distinguishes them.

Note what it costs: it is the check that fails under load, because the heaviest maps paint but do not
hold steady for three consecutive readings inside the window (#1512).

### `waitForSettledFraming` - `test/smoke/aggiemap/framing.ts`

Where the view ended up, once it has stopped moving. For asserting zoom and centre, which is its own
question again - a map can be fully drawn and looking at the wrong place.

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
Deciding a change fixed an intermittent blank map?   interleaved pixel-sampled blocks, with a control
Asserting where it is looking?  waitForSettledFraming()
Nothing to do with a map?       none of the above - a page with no probe needs no wait
```

A fixed `waitForTimeout` is not on that list. It is what both failed versions of the capture tool
used, and the length that works on an idle machine is not the length that works while a suite is
running - which is the same reason the release gate disagrees with itself under load (#1512).

## Measuring a map that is blank only sometimes

`ready`, `drawing` and `snapshot()` are all things the application says about
itself. A basemap change blanked the map on some loads, shipped three times in one day, and passed every
one of them: the probe reported ready, every layer loaded and drawable, and the canvas was white
([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)). **Pixel
sampling is the only trustworthy measure of whether a map drew.**

`test/smoke/aggiemap/blank-map.spec.ts` is the automated half: it fails a plain load that does not draw,
using the sampling in `paint.ts`, which this page does not restate. This section is the half a person
needs when deciding whether a change *fixed* something, which the automated check cannot say.

### The method

- Headless Chromium, **a fresh browser context for every load**, so no cache or service worker carries
  over.
- One warm-up load, discarded.
- Then N plain loads: the map's URL with no deep link and no nudging.
- After the probe reports `ready`, sample the map area for **30 seconds**. A load is **blank** if the
  area is pure white throughout.

### The rules that make a result mean something

1. **A single run proves nothing.** The fault is intermittent. The same build measured anywhere from 0 to
   4 blank loads in 15, depending on nothing anyone could identify.
2. **A clean result needs a control that reproduced beside it, in the same session.** Measure the known-bad
   build as well. One machine measured a candidate at 0 of 15 and believed it, then measured the known-bad
   build at 0 of 15 on the same rig. At a 13% blank rate a 15-load control comes back clean about one time
   in eight by chance (0.87^15 is about 0.12), so *a clean candidate beside a clean control is not a
   result.* It is a measurement that could not have found the fault.
3. **So blocks are big and interleaved.** Alternate candidate and control load by load, on one machine in
   one session, so that whatever drifts (load, network, the machine's mood) drifts for both. What settled
   #2459 was 45 loads of the candidate against 60 of the control: **0 of 45 against 9 of 60**, about a
   0.07% coincidence at the control's rate.
4. **Machines differ.** One machine could not reproduce the fault at all, so its numbers could never have
   cleared anything. If the control comes back clean, the machine has told you nothing about the
   candidate. Use another, or more loads.

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
