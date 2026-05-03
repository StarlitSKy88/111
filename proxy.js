const http = require('http');

const SERVER = `http://localhost:${process.env.PORT || 3001}`;

http.createServer((req, res) => {
  const url = `${SERVER}${req.url}`;
  const options = { method: req.method, headers: req.headers };

  const proxyReq = http.request(url, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
}).listen(8080);

console.log('代理运行在 http://localhost:8080');