const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/openai",
    createProxyMiddleware({
      target: "https://api.openai.com/v1/chat/completions",
      changeOrigin: true,
      pathRewrite: { "^/api/openai": "" },
    })
  );
};
