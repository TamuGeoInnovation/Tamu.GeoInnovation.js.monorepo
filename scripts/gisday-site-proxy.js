// Serves the gisday-angular dev server as another GIS Day site (#1835), for `scripts/gisday-local.sh web
// --site <key>`. A deployed container replaces ___ANGULAR_SITE___ in the app's scripts when it starts;
// this does the same to every script the dev server sends, so the page runs as that site.
//
// It also tells the API which site the page is on (#3050). The API chooses a site's sessions and emails by the request's
// host (siteHost: the Origin, then x-forwarded-host, then Host), and a page calling its own address sends no Origin on a
// GET, so without this the API saw localhost and answered as txgisday.org. Every request passed on carries
// x-forwarded-host: <site host>, as a request to the real site does through its ingress.
//
//   node gisday-site-proxy.js <site> <dev-server host> <dev-server port> <listen port> [<site host>]
const http = require('http');
const net = require('net');

const [site, host, port, listen, siteHost] = process.argv.slice(2);

http
  .createServer((req, res) => {
    const headers = { ...req.headers, 'accept-encoding': 'identity', ...(siteHost && { 'x-forwarded-host': siteHost }) };
    const up = http.request({ host, port, path: req.url, method: req.method, headers }, (r) => {
      if (!/javascript/.test(r.headers['content-type'] || '')) {
        res.writeHead(r.statusCode, r.headers);
        return r.pipe(res);
      }
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => {
        const body = Buffer.from(Buffer.concat(chunks).toString('utf8').replace(/___ANGULAR_SITE___/g, site));
        const h = { ...r.headers, 'content-length': body.length };
        delete h['transfer-encoding'];
        delete h.etag;
        res.writeHead(r.statusCode, h);
        res.end(body);
      });
    });
    up.on('error', (e) => {
      res.writeHead(502);
      res.end(String(e));
    });
    req.pipe(up);
  })
  // The dev server's live-reload socket, passed straight through.
  .on('upgrade', (req, socket, head) => {
    const up = net.connect(port, host, () => {
      up.write(`${req.method} ${req.url} HTTP/1.1\r\n` + Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') + '\r\n\r\n');
      up.write(head);
      up.pipe(socket).pipe(up);
    });
    up.on('error', () => socket.destroy());
  })
  .listen(listen, () => console.log(`serving ${host}:${port} as ${site}${siteHost ? ` (${siteHost})` : ''} on ${listen}`));
