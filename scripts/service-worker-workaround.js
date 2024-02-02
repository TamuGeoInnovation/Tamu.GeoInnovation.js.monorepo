const fs = require('fs');
const path = require('path');

const ngswWorkerFilePath = path.join(__dirname, '..', 'node_modules', '@angular', 'service-worker', 'ngsw-worker.js');
let ngswWorkerFile = fs.readFileSync(ngswWorkerFilePath).toString();
const regExps = [
  [/await cache\.(match|put)\((.*)\)/gm, 'await cache.$1($2).catch((e) => console.log(e))'],
  [/this\.cache\.(delete|match|put)\((.*)\);/gm, 'this.cache.$1($2).catch((e) => console.log(e));'],
  [/this\.cache\.(delete|match|put)\((.*)\)\.then/gm, 'this.cache.$1($2).catch((e) => console.log(e)).then']
];
for (const r of regExps) {
  console.log(`RegExp '${r[0].toString()}'`, ngswWorkerFile.match(r[0]));
  ngswWorkerFile = ngswWorkerFile.replace(r[0], r[1]);
}
fs.writeFileSync(ngswWorkerFilePath, ngswWorkerFile);
