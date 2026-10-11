// node serve-and-measure.js <dist dir> <label> <runs> <measure-load.js path>
// Serves a production build from a folder (gzip, index.html for unknown paths), then runs measure-load.js
// against it at desktop and phone settings. Both builds are measured the same way, on the same machine.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawn } = require('child_process');

const [dir, label, runs, measure] = process.argv.slice(2);
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const cache = new Map();

const server = http.createServer((req, res) => {
  let file = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html');
  const ext = path.extname(file);
  const compress = ['.js', '.css', '.html', '.json', '.svg'].includes(ext);
  if (!cache.has(file)) {
    const raw = fs.readFileSync(file);
    cache.set(file, compress ? zlib.gzipSync(raw) : raw);
  }
  const headers = { 'Content-Type': types[ext] || 'application/octet-stream' };
  if (compress) headers['Content-Encoding'] = 'gzip';
  res.writeHead(200, headers);
  res.end(cache.get(file));
});

// The measurements run as child processes without blocking this one, which has to keep serving.
const run = (mode) =>
  new Promise((resolve) => {
    const child = spawn('node', [measure, 'http://localhost:4400/map', `${label}-${mode}`, runs, mode], { stdio: ['ignore', 'inherit', 'ignore'] });
    child.on('exit', resolve);
  });

server.listen(4400, async () => {
  await run('desktop');
  await run('mobile');
  server.close();
});
