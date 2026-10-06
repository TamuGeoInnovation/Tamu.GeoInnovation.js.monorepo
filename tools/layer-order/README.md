# Layer list order: ours against the publisher's

A map's layer list is ordered one of two ways — alphabetically by title, or by the declaration order
of its `references` when `referenceLayerListOrder: 'source'` is set. Neither is the publisher's.

This tool works out what each map shows today, what the order would be if it followed the service
(layer 0 first, which for a service published from a Pro map is that map's own layer order), and
whether the two already agree.

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/<checkout>:/repo:ro" -w /repo node:22.23.3 \
  node tools/layer-order/compare.mjs
```

`--markdown` prints the table for the upstream issue.

## What it found on 6 October 2026 (#1508)

Eleven maps have an ordered reference list. **None can take the publisher's order without the list
moving:**

- **two are comparable and both would move** — `soccer-parking` and `volleyball-parking`
- **nine are not comparable** — their references are group layers, or they draw from more than one
  service. A group is this repository's construct; the service knows nothing about it, so there is
  no published order to defer to.
- `football-parking` and `tailgating` pass their layer enum straight to `references` and draw from
  several services at once, so no single publisher order exists for them either. Reported separately
  rather than counted as coverage.

So unlike symbology, order has no owner-published answer to fall back on today. Taking it from the
publisher properly means loading these maps from the owner's web maps, where layer order *is* a
decision somebody made, rather than from service URLs.

## Known limits

It reads the definitions as text rather than evaluating them, so a map that declares its references
in a shape it does not recognise is reported as unresolved rather than silently counted. Two bugs
worth knowing about, both now fixed and both of which produced a confident wrong answer: a
definitions object that is not exported, and a reference whose key differs from the definitions key.
