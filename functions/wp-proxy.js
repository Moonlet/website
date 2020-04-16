const functions = require("firebase-functions");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer(); // See (†)

proxy.on("proxyReq", function (proxyReq, req, res, options) {
  if (req.method == "POST" && req.body) {
    let body = req.body;
    // if (typeof req.body === "object") {
    //     body = JSON.stringify(req.body);
    //     console.log("POST", req.url, body);
    // }
    proxyReq.write(body);
    proxyReq.end();
  }
});

const wpProxy = functions.https.onRequest(function (req, res) {
  //console.log(req.url);
  proxy.web(req, res, {
    target: "https://212.146.84.81",
    headers: {
      Host: "wp.moonlet.xyz",
    },
    secure: false,
  });
});

module.exports = {
  wpProxy,
};
