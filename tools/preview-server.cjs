const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'app/wwwroot/game');
const port = Number(process.argv[2] || 8824);
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.webp': 'image/webp', '.wav': 'audio/wav' };
http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === '/') {
    const page = fs.readFileSync(path.join(root, 'app/MainPage.xaml.cs'), 'utf8');
    let html = page.slice(page.indexOf('<!DOCTYPE html>'), page.indexOf('</html>') + 7);
    html = html.replace('{{css}}', () => fs.readFileSync(path.join(assets, 'game.css'), 'utf8'))
      .replace('{{assetScript}}', '')
      .replace(/<script>\s*window\.nativeAds[\s\S]*?<\/script>/, '')
      .replace('{{js}}', () => fs.readFileSync(path.join(assets, 'flight-director.js'), 'utf8') + '\n' + fs.readFileSync(path.join(assets, 'game.js'), 'utf8'));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
    return;
  }
  const file = path.resolve(assets, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://localhost:${port}`));
