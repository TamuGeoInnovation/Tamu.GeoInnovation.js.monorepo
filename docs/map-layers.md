# How a map decides what its layers look like

**The map owner sets the cartography. We render it.**

A layer's appearance — its symbology, its name, and where it sits in the layer list — is the decision
of whoever publishes the service. Transportation chose those colours; we display them. Our job is to
be sure we are not breaking what they published, not to improve on it.

That is the whole rule, and it settles almost every question this page could otherwise be about. An
override is not a design choice we are entitled to make: it is an admission that we could not render
what the owner published, and it should be read as a defect with a workaround attached.

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

`declaresOwnRenderer` in `libs/maps/esri/src/lib/services/map/portal-symbology.ts` sees that and
leaves the layer alone — the portal item is not consulted at all for it.

### When it is right

**When we cannot render what the owner published.** That is the only reason. Not because their
symbology looks wrong to us, is inconsistent with another map, or would be clearer another way - those
are the owner's calls to make, and the place to raise them is with the owner.

The 150th anniversary marker is the shape of a legitimate one: inlined as base64 because the service's
own image endpoint returned 400. A real technical constraint, written down, removable when the
endpoint is fixed. Even that turned out to be unnecessary when tested - the Spirit of 150 Week cake
markers draw from the service perfectly well.

**The aesthetic cases do not survive being looked at.** Reviewed side by side on 6 October 2026, every
service-driven version was judged better than its hard-coded replacement, and the exception list came
out empty (#1508). That included the one everybody assumed was the exception: Construction replaced
the service's per-owner colours with a single orange hatch, on the reasoning that a map *about*
construction wants one construction colour. It is a persuasive sentence. The per-owner symbols - SSC,
TS, UES, TxDOT, Building Projects - are the better map, and the argument had survived unexamined in
#1028 for weeks.

So before overriding anything: capture it both ways and look at the two pictures. Ten minutes with
`tools/visual-baselines`. If the answer is still "theirs is wrong", that is a conversation with the
map owner, not a renderer in a definition file.

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

Same answer as symbology: **when the service cannot supply one.** The layer's name is the owner's
too. A service name that reads badly in a list is a request to the owner to rename it, not a string to
correct here.

A layer renamed upstream and not here shows a stale name with nothing to mark it stale, and the two
drift apart in silence. The Men's Basketball layers were renamed in the service and the map went on
calling them by their old names until somebody noticed the map was wrong ([#1431][1431]). Overriding
the name is what made that possible.

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

You are recording a defect, so write it down as one. In the definition, next to the override:

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
