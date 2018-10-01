const https = require('https');
const path = require('path');
const url = require('url');
const cp = require('child_process');
const fs = require('fs');


function dateToString(v) {
  var d = v.getDate(), dd = d<10? '0'+d:''+d;
  var m = 1+v.getMonth(), mm = m<10? '0'+m:''+m;
  var y = v.getFullYear(), yyyy = y;
  var h = v.getHours(), hh = h<10? '0'+h:''+h;
  var n = v.getMinutes(), nn = n<10? '0'+n:''+n;
  var s = v.getSeconds(), ss = s<10? '0'+s:''+s;
  return `${dd}-${mm}-${yyyy} ${hh}:${nn}:${ss}`;
};

function setFiletime(pth, dat) {
  var tim = dateToString(dat);
  console.log(path.basename(pth), tim);
  cp.exec(`nircmd setfiletime "${pth}" "${tim}" "${tim}"`, {stdio: [0, 1, 2]});
};

function download(url, pth) {
  var f = fs.createWriteStream(pth);
  return new Promise((fres, frej) => {
    var req = https.get(url, (res) => {
      res.on('error', frej)
      res.pipe(f).on('finish', fres);
    });
    req.on('error', frej);
  });
};

async function downloadAlbum(m, pth) {
  console.log(`Album: ${m.aName} (${m.photos.length})`);
  var dir = path.join(pth, m.aName);
  fs.mkdirSync(dir);
  var rdy = [];
  for(var p of m.photos) {
    var nam = path.basename(url.parse(p.url).pathname);
    var fil = path.join(dir, nam);
    rdy.push(download(p.url, fil));
  }
  await Promise.all(rdy);
  for(var p of m.photos) {
    var nam = path.basename(url.parse(p.url).pathname);
    var fil = path.join(dir, nam);
    setFiletime(fil, new Date(p.date));
  }
};

async function main() {
  const A = process.argv;
  var txt = fs.readFileSync(A[2], 'utf8').substring(1);
  var m = JSON.parse(txt);
  await downloadAlbum(m, A[3]||process.cwd());
};
main();
