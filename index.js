const https = require('https');
const path = require('path');
const url = require('url');
const cp = require('child_process');
const fs = require('fs');


function download(url, pth) {
  var f = fs.createWriteStream(pth);
  return https.get(url, (res) => res.pipe(f));
};

function downloadAlbum(m, pth) {
  console.log(`Album: ${m.aName} (${m.photos.length})`);
  var dir = path.join(pth, m.aName);
  fs.mkdirSync(dir);
  for(var p of m.photos) {
    var nam = path.basename(url.parse(p.url).pathname);
    var fil = path.join(dir, nam);
    var req = download(p.url, fil);
    req.on('finish', () => cp.execSync(`nircmd setfiletime "${fil}" "${p.date}" "${p.date}"`, {stdio: [0, 1, 2]}));
  }
};

function main() {
  const A = process.argv;
  var m = JSON.parse(fs.readFileSync(A[2]));
  downloadAlbum(m, A[3]||process.cwd());
};
