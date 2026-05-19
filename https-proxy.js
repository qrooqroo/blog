const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const options = {
  key:  fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt')),
};

const TARGET_PORT = 3000;

https.createServer(options, (req, res) => {
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) res.writeHead(502);
    res.end();
  });
}).listen(8443, () => {
  console.log('HTTPS proxy listening on :8443 → http://127.0.0.1:3000');
});
