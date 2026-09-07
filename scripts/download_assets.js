const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '..', 'public', 'assets', 'images');
fs.mkdirSync(targetDir, { recursive: true });

// Read the html
const html = fs.readFileSync('/tmp/moneysolution.html', 'utf8');

// Match all wp-content/uploads URLs
const regex = /https:\/\/moneysolution\.co\.in\/wp-content\/uploads\/[^\s"'\)\<]+/g;
const matches = html.match(regex) || [];
const uniqueUrls = [...new Set(matches)];

console.log(`Found ${uniqueUrls.length} unique upload assets to download.`);

function download(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve({ url, status: 'ok' }));
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        resolve({ url, status: `failed with ${res.statusCode}` });
      }
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      resolve({ url, status: `error: ${err.message}` });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ url, status: 'timeout' });
    });
  });
}

async function run() {
  let successCount = 0;
  for (const url of uniqueUrls) {
    const cleanUrl = url.split('?')[0];
    const filename = path.basename(cleanUrl);
    const dest = path.join(targetDir, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      successCount++;
      continue;
    }

    const res = await download(url, dest);
    if (res.status === 'ok') {
      successCount++;
    } else {
      console.warn(`Could not download ${url}: ${res.status}`);
    }
  }
  console.log(`Downloaded ${successCount} / ${uniqueUrls.length} assets successfully into ${targetDir}`);
}

run();
