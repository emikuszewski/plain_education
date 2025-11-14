const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://presales-platform.us1.plainid.io',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/v1', // rewrite path
      },
      headers: {
        Authorization: `Bearer oye5i0uZ6XSt22aspTilh2YokktFUPD8`,
      },
      onProxyReq: (proxyReq) => {
        // Log the proxied URL for debugging
        console.log('Proxying to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          error: 'Proxy Error', 
          message: err.message 
        }));
      }
    })
  );
};
