// Batch 26: do two captures of the same framing differ where a buildings tile was lost? Map area only.
const fs = require('fs'); const { PNG } = require('/w/node_modules/pngjs');
const a = PNG.sync.read(fs.readFileSync(process.argv[2]));
for (const f of process.argv.slice(3)) {
  const b = PNG.sync.read(fs.readFileSync(f)); let n = 0, box = [1e9, 1e9, -1, -1];
  for (let y = 0; y < 770; y++) for (let x = 0; x < 915; x++) {
    const i = (y * a.width + x) * 4;
    if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 30) {
      n++; box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)];
    }
  }
  console.log(f.split('/').pop(), 'differing pixels in the map area:', n, n ? 'box ' + box.join(',') : '');
}
