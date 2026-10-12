/**
 * Finds picture markers whose published size does not match the art they ship (#1523).
 *
 *   node tools/layer-symbols/compare.mjs                      # report
 *   node tools/layer-symbols/compare.mjs --markdown           # the table for the upstream issue
 *   node tools/layer-symbols/compare.mjs --extract <outDir>   # write each symbol's art as a png
 *
 * A service can declare a symbol 25x25 while the image it ships is 32x40. Esri then draws the art
 * squeezed into a square, on the map and in the legend swatch, and AggieMap carries a `legend`
 * sizing hint to re-render it at its true ratio. The hint is a workaround for a value that is wrong
 * at the source - republishing the symbol at its real proportions removes the need for it.
 *
 * Every service named in connections.ts is scanned, so this finds the layers nobody has looked at as
 * well as the ones already worked around. Re-run it to see what is left.
 */
import * as fs from 'fs';
import * as path from 'path';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const markdown = process.argv.includes('--markdown');
const extractAt = process.argv.indexOf('--extract');
const extractDir = extractAt === -1 ? null : process.argv[extractAt + 1];

const connections = fs.readFileSync(path.join(REPO, 'libs/aggiemap/ngx/common/src/lib/connections.ts'), 'utf8');

const hosts = {};
for (const m of connections.matchAll(/const (\w*[Hh]ost) = '([^']+)';/g)) {
  hosts[m[1]] = m[2];
}

/** Every production service URL in connections.ts, keyed by its connection name. */
const services = {};
for (const m of connections.matchAll(/(\w+Url):\s*`([^`]+)`/g)) {
  let value = m[2];

  for (const [name, host] of Object.entries(hosts)) {
    value = value.split('${' + name + '}').join(host);
  }

  if (!services[m[1]] && !value.includes('${') && /\/(Feature|Map)Server$/.test(value)) {
    services[m[1]] = value;
  }
}

const getJson = async (url) => {
  try {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'f=json');

    return await res.json();
  } catch {
    return null;
  }
};

/** Width and height from a PNG's IHDR chunk, which is always the first one. */
const pngSize = (base64) => {
  const buf = Buffer.from(base64, 'base64');

  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) {
    return null;
  }

  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

const symbolsOf = (renderer) => {
  const out = [];

  if (renderer.symbol) {
    out.push({ symbol: renderer.symbol, label: '' });
  }

  (renderer.uniqueValueInfos || []).forEach((u) => u.symbol && out.push({ symbol: u.symbol, label: u.label || u.value }));
  (renderer.uniqueValueGroups || []).forEach((g) =>
    (g.classes || []).forEach((c) => c.symbol && out.push({ symbol: c.symbol, label: c.label || (c.values || []).join('/') }))
  );
  (renderer.classBreakInfos || []).forEach((c) => c.symbol && out.push({ symbol: c.symbol, label: c.label || '' }));

  return out;
};

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

/** Runs `work` over `items` a few at a time, so a few hundred layers do not take a few hundred round trips. */
async function pooled(items, size, work) {
  const queue = [...items];
  const out = [];

  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) {
        const item = queue.shift();
        const result = await work(item);

        if (result) {
          out.push(...(Array.isArray(result) ? result : [result]));
        }
      }
    })
  );

  return out;
}

const roots = Object.entries(services);
const layerUrls = await pooled(roots, 8, async ([name, url]) => {
  const json = await getJson(url);

  if (!json || json.error || !Array.isArray(json.layers)) {
    return null;
  }

  return json.layers.map((l) => ({ connection: name, service: url, id: l.id, name: l.name }));
});

const findings = await pooled(layerUrls, 8, async (layer) => {
  const json = await getJson(layer.service + '/' + layer.id);

  if (!json || json.error || !json.drawingInfo || !json.drawingInfo.renderer) {
    return null;
  }

  const out = [];
  const seen = new Set();

  for (const { symbol, label } of symbolsOf(json.drawingInfo.renderer)) {
    if (symbol.type !== 'esriPMS' || !symbol.imageData) {
      continue;
    }

    const art = pngSize(symbol.imageData);

    if (!art) {
      continue;
    }

    const declaredRatio = symbol.width / symbol.height;
    const artRatio = art.width / art.height;

    // A tenth of a ratio point is roughly where a pin starts to look visibly squashed.
    if (Math.abs(declaredRatio - artRatio) < 0.05) {
      continue;
    }

    const key = `${symbol.width}x${symbol.height}:${art.width}x${art.height}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    out.push({
      connection: layer.connection,
      service: layer.service,
      layerId: layer.id,
      layerName: json.name || layer.name,
      label,
      declared: { width: symbol.width, height: symbol.height },
      art,
      imageData: symbol.imageData
    });
  }

  return out;
});

findings.sort((a, b) => (a.layerName + a.label).localeCompare(b.layerName + b.label));

if (extractDir) {
  fs.mkdirSync(extractDir, { recursive: true });

  findings.forEach((f) => {
    f.file = slug(f.connection.replace(/Url$/, '') + '-' + f.layerName + (f.label ? '-' + f.label : '')) + '-' + f.declared.width + 'x' + f.declared.height + '.png';
    fs.writeFileSync(path.join(extractDir, f.file), Buffer.from(f.imageData, 'base64'));
  });

  console.log(`wrote ${findings.length} symbol images to ${extractDir}`);
}

if (markdown) {
  const base = process.env.SYMBOL_IMAGE_BASE || '.';

  console.log('| Service | Layer | Symbol | As the service declares it | As the art really is | What the map shows today |');
  console.log('| --- | --- | --- | --- | --- | --- |');

  findings.forEach((f) => {
    const file = f.file || slug(f.connection.replace(/Url$/, '') + '-' + f.layerName + (f.label ? '-' + f.label : '')) + '-' + f.declared.width + 'x' + f.declared.height + '.png';
    const src = `${base}/${file}`;
    const corrected = { width: 24, height: Math.round((24 * f.art.height) / f.art.width) };

    console.log(
      `| ${f.service.split('/services/')[1].replace(/\/(Feature|Map)Server$/, '')} | ${f.layerName} | ${f.label || '(single symbol)'} ` +
        `| ${f.declared.width}x${f.declared.height} <br><img src="${src}" width="${f.declared.width}" height="${f.declared.height}"> ` +
        `| ${f.art.width}x${f.art.height} <br><img src="${src}" width="${Math.min(f.art.width, 60)}"> ` +
        `| <img src="${src}" width="${corrected.width}" height="${corrected.height}"> |`
    );
  });

  process.exit(0);
}

console.log(`${roots.length} services in connections.ts, ${layerUrls.length} layers reachable`);
console.log(`${findings.length} picture markers published at a size that does not match their art\n`);

findings.forEach((f) => {
  console.log(
    `  ${f.layerName.padEnd(32)}${(f.label || '').padEnd(28)}` +
      `declares ${f.declared.width}x${f.declared.height}  art ${f.art.width}x${f.art.height}`
  );
  console.log(`      ${f.service}/${f.layerId}`);
});
