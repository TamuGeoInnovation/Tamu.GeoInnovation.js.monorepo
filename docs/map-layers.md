# How a map decides what its layers look like

A layer's appearance — its symbology, its name, and where it sits in the layer list — comes from the
service that publishes it. This page is about the cases where it should not, how to override each
one, and what to write down when you do.

It exists because the default is being inverted. Until [#1497][1497] the maps drew a flattened copy of
each symbol and anything better had to be hard-coded; after [#1508][1508] the service is the source in
practice as well as in principle. An override is now the exception, and an exception nobody can find
is one that gets reinvented badly.

## Where a layer's appearance comes from

Three places, in this order. The first one that supplies a value wins.

| Order | Source | What it gives |
| --- | --- | --- |
| 1 | **The definition** — `native.renderer`, `title`, declaration order | Whatever a map chooses to set |
| 2 | **The portal item** — the symbol drawn in ArcGIS Pro | The authored CIM symbology |
| 3 | **The service definition** — `drawingInfo` on the REST layer | A flattened approximation |

Most of the time 1 is empty and 2 answers. The gap between 2 and 3 is the whole of [#1497][1497]: of
128 hosted layers surveyed on 6 October 2026, **128 publish CIM symbology on their portal item and 0
publish it on their service**. A layer loaded by its service URL without the portal lookup draws the
flattened one, which is why the Football micromobility routes drew a 15-point slab where a 1.95-point
line with arrowheads had been authored ([#1496][1496]).

---

## Symbology

### How

Set `renderer` inside a layer source's `native` block:

```ts
{
  type: 'feature',
  id: MAIN_MAP_LAYERS.CONSTRUCTION,
  title: 'Construction Zones',
  url: `${connections.constructionUrl}/0`,
  native: {
    outFields: ['*'],
    renderer: {
      type: 'simple',
      symbol: orangeHatch
    }
  }
}
```

`declaresOwnRenderer` in
[`portal-symbology.ts`](../libs/maps/esri/src/lib/services/map/portal-symbology.ts) sees that and
leaves the layer alone — the portal item is not consulted at all for it.

### When it is right

**When the map means something different from the service.** The Construction layer is the standing
example: the service colours each zone by its owner, and a map *about* construction wants one
construction colour, so it replaces the renderer with a single orange hatch. That is a deliberate
editorial decision, not a workaround, and it should stay.

**When the service genuinely cannot supply it.** These exist and are worth distinguishing from the
first kind, because they can be removed later and the first kind cannot. The 150th anniversary marker
was inlined as base64 because the service's own image endpoint returned 400.

### When it is not right

**Because the service's symbol looked wrong and copying it by hand was quicker.** That is how the
micromobility routes ended up with a hand-approximated 3-point line with an arrow: somebody was
matching an authored symbol by eye because the service would not hand it over. The fix was to read the
portal item, not to keep a better copy.

A renderer in a definition is a silent dependency on somebody's memory. It works until the data
changes and someone reasonably expects the map to follow, and then it fails quietly — nothing errors,
the map just shows something that stopped being true. That is [#1028][1028].

---

## Legend sizing is not symbology

`legend` on a layer source is a width and height hint, applied to the legend swatch *and* to the
on-map picture markers:

```ts
legend: { mode: 'renderer-symbol', preserveAspectRatio: true, fit: 'contain', width: 25, height: 30 }
```

It does not replace the service's symbol; it stops a non-square picture marker being stretched. Those
are fine to keep when the service's marker is not square, and they are not what [#1508][1508] is
removing.

---

## Titles

### How

`title` on the layer source is what the layer list and the legend show:

```ts
{ type: 'feature', id: ..., title: 'Bike Dismount Zones', url: ... }
```

### When it is right

**When the service's name is not a name for a visitor.** Service layers are named by whoever published
them, sometimes for their own filing rather than for a map — a suffix, an internal code, a plural that
reads oddly in a list next to others.

Otherwise prefer the service's. A layer renamed upstream and not here shows a stale name with nothing
to indicate it is stale, and the two drift apart silently. The Men's Basketball layers were renamed in
the service and the map kept calling them by their old names until somebody noticed the map was wrong
([#1431][1431]).

---

## Layer list order

### How

Two things together, and **both are needed**:

1. **Declare the layer sources in the order you want.** The legend draws in this order.
2. **Set `referenceLayerListOrder: 'source'`** on the map's configuration.

```ts
export const FootballParkingConfiguration: EventConfiguration = {
  id: 'gameday-parking',
  // ...
  referenceLayerListOrder: 'source',
};
```

Without the second, the layer list sorts **alphabetically** and the declaration order does nothing.
That is the half that is easy to miss: the Football micromobility layers were declared in service
order and the list still read "Bike Dismount Zones, Bike Veo Geofence, Micromobility Parking Area"
while the legend immediately below read the same three the other way round ([#996][996], [#1433][1433]).

### When it is right

**When the order means something** — a route and then where it ends, a parking area and then how to
reach it. Alphabetical is a reasonable default for a list of unrelated layers and actively unhelpful
for a sequence.

Three maps use `source` today: Fish Camp, Tailgating and Football.

### What it costs

`framing.spec.ts` compares where every map opens against `framing-baseline.json`, and the legend and
layer list are two surfaces that have to agree. Changing order means refreshing the baseline in the
same pull request, or the check starts failing for a correct change — see [#1501][1501].

---

## If you do override something

Write down **why**, in the definition, next to the override:

- what the service or portal item could not supply, or what the map means differently;
- what would let the override be removed — a republished service, a fixed image endpoint;
- the issue, if there is one.

The 150th marker's comment is the model: it says the image endpoint returns 400, that the copy goes
stale whenever the source symbol changes, and the date it was last synced by hand. Someone reading it
later knows exactly what to check.

An override with no comment is indistinguishable from an oversight, and the next person has to
rediscover the reason — or, more likely, leave it alone because they cannot tell whether it matters.

[996]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/996
[1028]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1028
[1431]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1431
[1433]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1433
[1496]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1496
[1497]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1497
[1501]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1501
[1508]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1508
