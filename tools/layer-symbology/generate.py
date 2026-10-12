# Turn collect.js output into docs/layer-symbology.md and docs/layer-symbology/ (#1578). See README.md.
# Usage: python generate.py "<collected.json>[;<more.json>]" <repo root> "<where collected>" "<date>"
import base64, hashlib, json, os, re, sys, shutil, urllib.request, ssl
from collections import defaultdict

collected_paths, root, build, collected_on = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
data = None
for cp in collected_paths.split(';'):
    d = json.load(open(cp, encoding='utf-8'))
    if data is None:
        data = d
        if len(collected_paths.split(';')) > 1:
            data['maps'] = [m for m in d['maps'] if m['layers']]
    else:
        data['maps'] += d['maps']
outdir = os.path.join(root, 'docs', 'layer-symbology')
icondir = os.path.join(outdir, 'icons')
os.makedirs(icondir, exist_ok=True)
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE

def rgb(c):
    return '#%02x%02x%02x' % tuple(int(x) for x in c[:3])

def hexa(c, scale=255):
    """A colour as hex, with its opacity when it is not opaque. esri JSON alpha is 0-255, CIM's 0-100."""
    if not c: return 'none'
    if isinstance(c, list) and len(c) >= 3:
        o = round(c[3] / scale * 100) if len(c) > 3 else 100
        return rgb(c) if o >= 100 else f'{rgb(c)} at {o}%'
    return str(c)

def cim_scale(c):
    # CIM alpha is 0-100, but some symbols carry 0-255; anything above 100 is read as 0-255.
    return 255 if (c and len(c) > 3 and c[3] > 100) else 100

def STYLE(st):
    return re.sub(r'^esri(SFS|SLS|SMS)', '', st or '').lower()

def svg_colour(c, scale):
    if not c or len(c) < 3: return 'none', 0
    return rgb(c), round((c[3] / scale) if len(c) > 3 else 1, 3)

def swatch(kind, colour, outline, cim=False):
    """A small SVG of a fill, line or marker, saved once per distinct look, for comparing by eye."""
    fc, fa = svg_colour(colour, cim_scale(colour) if cim else 255)
    oc_raw = outline.get('color') if isinstance(outline, dict) else None
    oc, oa = svg_colour(oc_raw, cim_scale(oc_raw) if cim else 255)
    ow = max(0.5, min(float(outline.get('width') or 1), 6)) if isinstance(outline, dict) and oc_raw else 0
    if kind == 'fill':
        body = f'<rect x="3" y="3" width="34" height="18" fill="{fc}" fill-opacity="{fa}" stroke="{oc}" stroke-opacity="{oa}" stroke-width="{ow}"/>'
    elif kind == 'line':
        w = float(outline.get('width') or 2) if isinstance(outline, dict) else 2
        body = f'<line x1="3" y1="12" x2="37" y2="12" stroke="{fc}" stroke-opacity="{fa}" stroke-width="{max(1, min(w, 8))}"/>'
    else:
        body = f'<circle cx="20" cy="12" r="8" fill="{fc}" fill-opacity="{fa}" stroke="{oc}" stroke-opacity="{oa}" stroke-width="{ow}"/>'
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 40 24">{body}</svg>' + chr(10)
    h = hashlib.sha1(svg.encode()).hexdigest()[:12]
    if h not in icons:
        open(os.path.join(icondir, f'{h}.svg'), 'w', encoding='utf-8', newline=chr(10)).write(svg)
        icons[h] = f'layer-symbology/icons/{h}.svg'
    return icons[h]

icons = {}  # key -> relative path
def save_icon(sym):
    raw = None; ext = 'png'
    if sym.get('imageData'):
        raw = base64.b64decode(sym['imageData']); ext = (sym.get('contentType') or 'image/png').split('/')[-1]
    elif sym.get('url'):
        u = sym['url']
        if u.startswith('data:'):
            m = re.match(r'data:image/(\w+);base64,(.*)', u, re.S)
            if m: ext, raw = m.group(1), base64.b64decode(m.group(2))
        else:
            local = None
            if not u.startswith('http'):
                name = u.split('/assets/', 1)[-1]
                for base in ['apps/aggiemap-angular/src/assets', 'libs/assets']:
                    cand = os.path.join(root, base, name)
                    if os.path.exists(cand): local = cand; break
            try:
                raw = open(local, 'rb').read() if local else urllib.request.urlopen(u if u.startswith('http') else data['baseUrl'] + u, context=ctx, timeout=20).read()
                ext = u.rsplit('.', 1)[-1].split('?')[0][:4] or 'png'
            except Exception:
                return None
    if not raw: return None
    h = hashlib.sha1(raw).hexdigest()[:12]
    if h not in icons:
        fn = f'{h}.{ext}'
        open(os.path.join(icondir, fn), 'wb').write(raw)
        icons[h] = f'layer-symbology/icons/{fn}'
    return icons[h]

cim_fills, cim_strokes, cim_pictures = [], [], []

def cim_summary(sym):
    global cim_fills, cim_strokes, cim_pictures
    cim_fills, cim_strokes, cim_pictures = [], [], []
    parts = []
    def walk(o):
        if isinstance(o, dict):
            t = o.get('type', '')
            if t in ('CIMSolidFill', 'CIMSolidStroke'):
                col = o.get('color', {}).get('values') if isinstance(o.get('color'), dict) else o.get('color')
                c = hexa(col, cim_scale(col)) if col and len(col) >= 3 else '?'
                if t == 'CIMSolidFill':
                    cim_fills.append(col)
                else:
                    cim_strokes.append((col, o.get('width', 1)))
                parts.append(('fill ' if t == 'CIMSolidFill' else 'stroke ') + c + (f" {round(o['width'], 1)}pt" if 'width' in o else ''))
            elif t == 'CIMPictureMarker':
                parts.append('picture marker' + (f" {o.get('size')}pt" if o.get('size') else ''))
                if o.get('url'):
                    cim_pictures.append(o['url'])
            elif t == 'CIMHatchFill':
                parts.append('hatch')
            elif t == 'CIMVectorMarker':
                parts.append('vector marker' + (f" {o.get('size')}pt" if o.get('size') else ''))
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    walk(sym)
    seen = []
    for p in parts:
        if p not in seen: seen.append(p)
    return 'CIM: ' + ', '.join(seen[:8]) if seen else 'CIM symbol'

def describe(sym):
    """A one-line description of a symbol, and an icon path if it is a picture."""
    if not sym: return 'none', None
    t = sym.get('type', '')
    if t in ('esriPMS', 'picture-marker'):
        return f"picture marker {sym.get('width', '?')}×{sym.get('height', '?')}", save_icon(sym)
    if t in ('esriPFS', 'picture-fill'):
        return 'picture fill', save_icon(sym)
    out = sym.get('outline')
    ol = f", outline {hexa(out.get('color'))} {out.get('width', '')}".rstrip() if isinstance(out, dict) else ''
    if t in ('esriSMS', 'simple-marker'):
        return f"marker {STYLE(sym.get('style'))} {hexa(sym.get('color'))} size {sym.get('size', '?')}{ol}", swatch('marker', sym.get('color'), out)
    if t in ('esriSLS', 'simple-line'):
        return f"line {STYLE(sym.get('style'))} {hexa(sym.get('color'))} width {sym.get('width', '?')}", swatch('line', sym.get('color'), {'width': sym.get('width', 1)})
    if t in ('esriSFS', 'simple-fill'):
        return f"fill {STYLE(sym.get('style'))} {hexa(sym.get('color'))}{ol}", swatch('fill', sym.get('color'), out)
    if t in ('esriTS', 'text'):
        return f"text {hexa(sym.get('color'))}", None
    if t == 'CIMSymbolReference':
        d = cim_summary(sym)
        if cim_pictures:
            return d, save_icon({'url': cim_pictures[0]})
        if 'vector marker' in d:
            return d, None
        if cim_fills:
            st = cim_strokes[0] if cim_strokes else None
            return d, swatch('fill', cim_fills[0], {'color': st[0], 'width': st[1]} if st else None, cim=True)
        if cim_strokes:
            return d, swatch('line', cim_strokes[-1][0], {'width': cim_strokes[-1][1]}, cim=True)
        return d, None
    return t or 'unknown', None

def classes(r):
    """[(label, symbol)] for any renderer."""
    t = r.get('type')
    if t == 'simple':
        return [(r.get('label') or '(all features)', r.get('symbol'))]
    if t == 'uniqueValue':
        out = [(i.get('label') or str(i.get('value')), i.get('symbol')) for i in r.get('uniqueValueInfos', [])]
        if r.get('defaultSymbol'): out.append((r.get('defaultLabel') or '(other)', r['defaultSymbol']))
        return out
    if t == 'classBreaks':
        return [(i.get('label') or f"≤ {i.get('classMaxValue')}", i.get('symbol')) for i in r.get('classBreakInfos', [])]
    return []

def rkey(r):
    return hashlib.sha1(json.dumps(r, sort_keys=True).encode()).hexdigest()[:10]

SOURCE = {'own': 'own (definition)', 'portal': 'portal item', 'service': 'service', 'default': '**default** (nothing usable)'}

# Distinct layer renderers, with the maps that use them.
distinct = {}   # (title, rkey) -> dict
uses = defaultdict(list)  # symbol description -> [(layer title, class label)]
failed = []
for m in data['maps']:
    if not m['layers']:
        failed.append((m['mapPath'], m['note'])); continue
    for l in m['layers']:
        r = l.get('renderer')
        if not r or l.get('symbology') is None:
            continue
        k = (l['title'] or l['id'], rkey(r))
        if k not in distinct:
            distinct[k] = {'layer': l, 'maps': []}
        distinct[k]['maps'].append(m['mapPath'])

def strip_images(o):
    if isinstance(o, dict):
        if o.get('imageData') or (isinstance(o.get('url'), str) and o['url'].startswith('data:')):
            path = save_icon(o)
            o = {k: v for k, v in o.items() if k != 'imageData'}
            if isinstance(o.get('url'), str) and o['url'].startswith('data:'):
                o['url'] = '(embedded image)'
            if path:
                o['savedAs'] = path
        return {k: strip_images(v) for k, v in o.items()}
    if isinstance(o, list):
        return [strip_images(v) for v in o]
    return o

json.dump({'baseUrl': data['baseUrl'], 'collected': data['collected'], 'build': build,
           'layers': [{'title': k[0], 'id': v['layer']['id'], 'type': v['layer']['type'], 'symbology': v['layer']['symbology'],
                       'maps': sorted(set(v['maps'])), 'renderer': strip_images(v['layer']['renderer'])} for k, v in sorted(distinct.items())]},
          open(os.path.join(outdir, 'renderers.json'), 'w', encoding='utf-8', newline='\n'), indent=1)

lines = []
counts = defaultdict(int)
for (title, _), v in sorted(distinct.items(), key=lambda kv: kv[0][0].lower()):
    l = v['layer']; r = l['renderer']; counts[l['symbology']] += 1
    maps = sorted(set(v['maps']))
    mapstr = ', '.join(f'`{p}`' for p in maps[:6]) + (f' and {len(maps) - 6} more' if len(maps) > 6 else '')
    field = ' by ' + ', '.join(f'`{f}`' for f in [r.get('field1') or r.get('field'), r.get('field2'), r.get('field3')] if f) if r.get('field1') or r.get('field') else ''
    if r.get('valueExpression'): field = ' by an Arcade expression'
    dup = sum(1 for (t2, _) in distinct if t2 == title) > 1
    lines.append(f"### {title}{f' ({maps[0]})' if dup else ''}\n\n`{l['id']}`, {l['type']} layer. Symbology from: {SOURCE.get(l['symbology'], l['symbology'])}. "
                 f"Renderer: {r.get('type')}{field}. Used on {mapstr}.\n")
    cl = classes(r)
    if cl:
        lines.append('| Class | | Symbol |\n| --- | --- | --- |')
        for label, sym in cl:
            d, icon = describe(sym)
            key = f'![]({icon}) {d}' if icon else d
            if (title, label) not in uses[key]:
                uses[key].append((title, label))
            lines.append(f"| {label} | {f'![]({icon})' if icon else ''} | {d} |")
        lines.append('')
    else:
        lines.append(f"Renderer type `{r.get('type')}` has no classes to list; its full JSON is in `renderers.json`.\n")

symlines = []
for d, us in sorted(uses.items(), key=lambda kv: (-len(kv[1]), kv[0])):
    who = '; '.join(f'{t} ({c})' for t, c in us[:5]) + (f'; and {len(us) - 5} more' if len(us) > 5 else '')
    symlines.append(f'| {d} | {len(us)} | {who} |')

doc = f'''# Layer symbology inventory

Every layer on every AggieMap map, with where its symbology comes from and exactly what it draws. Made
for [#1578](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1578): to find any
layer drawing ArcGIS's default symbol, and to give a single picture of the symbols in use, for
standardizing the look across maps. How a layer's symbology is decided is [`map-layers.md`](map-layers.md).

**Collected on {collected_on}** from {build}. Each of the {len(data['maps'])} maps was loaded and the map
probe asked, for every layer the map had made, where its symbology came from and what renderer it was
drawing (`MapProbe.renderers()`). So this records what is actually drawn - after the portal item's
symbology (#1497) and every override - not what a definition file appears to say.

**Not covered:** a layer created only when someone switches it on (`loadOnInit: false`) does not exist
when a map loads, so it is not here; nor are layers without a renderer (basemaps, tile, image and graphics
layers). {f"{len(failed)} map(s) did not load and are listed at the end." if failed else "Every map loaded."}

**Result: {"no layer draws ArcGIS's default symbol" if not counts.get('default') else str(counts['default']) + " layer renderer(s) draw ArcGIS's default symbol, marked **default** below"}.** Of the
{sum(counts.values())} distinct layer renderers, {counts.get('own', 0)} are a map's own choice, {counts.get('portal', 0)} come from the
portal item and {counts.get('service', 0)} from the service. Dining and AggiePrint, which drew the default symbol on
production for two days, are among the map's own choices since #1579 (#1576). `maps.spec.ts` now fails on
any layer drawing the default symbol, so this does not need re-running to stay safe. To refresh the
inventory after symbology changes, see [`tools/layer-symbology`](../tools/layer-symbology/README.md).

The full renderer JSON for each layer below is in [`layer-symbology/renderers.json`](layer-symbology/renderers.json),
and picture-marker icons are saved under [`layer-symbology/icons/`](layer-symbology/icons/).

## Symbols in use, across maps

Each distinct symbol, how many layer classes use it, and where. Near-duplicates here are the candidates
for standardizing.

| Symbol | Uses | Where (layer (class)) |
| --- | ---: | --- |
{chr(10).join(symlines)}

## By layer

{chr(10).join(lines)}
'''
if failed:
    doc += '\n## Maps that did not load\n\n' + '\n'.join(f'- `{p}`: {n}' for p, n in failed) + '\n'
open(os.path.join(root, 'docs', 'layer-symbology.md'), 'w', encoding='utf-8', newline='\n').write(doc)
print('layers', len(distinct), 'symbols', len(uses), 'icons', len(icons), 'counts', dict(counts), 'failed', len(failed))
