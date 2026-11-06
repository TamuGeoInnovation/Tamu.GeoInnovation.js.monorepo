const { PNG } = require('/w/node_modules/pngjs');
const fs = require('fs');
const [a, b] = process.argv.slice(2).map((f) => PNG.sync.read(fs.readFileSync(f)));
let n = 0, box = [1e9, 1e9, -1, -1];
for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) { const i = (y * a.width + x) * 4; if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 30) { n++; box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)]; } }
console.log(process.argv[2], 'vs', process.argv[3], ': differing pixels', n, 'of', a.width * a.height, n ? 'in box ' + box : '');
