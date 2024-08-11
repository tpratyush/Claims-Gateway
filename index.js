const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const cors = require('cors');
app.use(cors());
const port = process.env.PORT || 3002;
const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3001';

app.use('/', createProxyMiddleware({
  target: mainAppUrl,
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received proxy response:', proxyRes.statusCode, req.url);
    let body = '';
    proxyRes.on('data', function (chunk) {
      body += chunk;
    });
    proxyRes.on('end', function () {
      console.log('Response body:', body);
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  },
}));

app.listen(port, () => {
  console.log(`Gateway server listening on port ${port}`);
});