const request = require("request");
const parsers = require("./parsers");
const urlCollector = require("./url-collector");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

const Agent = require("agentkeepalive").HttpsAgent;
const keepAliveAgent = new Agent({
  maxSockets: 5,
  maxFreeSockets: 5,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

const getUrl = (url, fileName) => {
  return new Promise((resolve, reject) => {
    request
      .get(
        url,
        {
          agent: keepAliveAgent,
          strictSSL: false,
        },
        (err, response, body) => {
          if (err) {
            return reject({ err, response });
          }

          return resolve({ body, response });
        }
      )
      .pipe(fs.createWriteStream(fileName));
  });
};

const defaultOptions = {
  urls: [],
  urlFilter: (url) => true,
};

const scrapper = async (options) => {
  options = Object.assign({}, defaultOptions, options);
  urlCollector.setUrlFilter(options.urlFilter);
  urlCollector.push(options.urls);

  let statuses = {};

  while ((nextUrl = urlCollector.getNext())) {
    try {
      let f = urlCollector.getUrl(nextUrl);
      let file = path.normalize(options.dest + f.fileName);
      shell.mkdir("-p", path.dirname(file));
      let req = await getUrl(nextUrl, file);

      let fileContent = req.body;

      if (
        req.response.headers["content-type"] &&
        req.response.headers["content-type"].startsWith("text/html")
      ) {
        const html = parsers.html(req.body);
        urlCollector.push(html.links, nextUrl);
        urlCollector.push(html.images, nextUrl);
        urlCollector.push(html.js, nextUrl);
        urlCollector.push(html.css, nextUrl);

        fileContent = applyModifiers(
          file,
          options.fileModifiers && options.fileModifiers["html"],
          fileContent,
          file,
          nextUrl
        );
      }

      if (
        req.response.headers["content-type"] &&
        req.response.headers["content-type"].startsWith("text/css")
      ) {
        const css = parsers.css(req.body);
        urlCollector.push(css.resources, nextUrl);

        fileContent = applyModifiers(
          file,
          options.fileModifiers && options.fileModifiers["html"],
          fileContent,
          file,
          nextUrl
        );
      }

      if (
        req.response.headers["content-type"] &&
        req.response.headers["content-type"].startsWith("text/javascript")
      ) {
        applyModifiers(
          file,
          options.fileModifiers && options.fileModifiers["html"],
          fileContent,
          file,
          nextUrl
        );
      }

      console.log(req.response.statusCode, nextUrl);
      statuses = {
        ...statuses,
        [req.response.statusCode]: (statuses[req.response.statusCode] || 0) + 1,
      };
    } catch (err) {
      console.log(nextUrl, err);
      statuses = {
        ...statuses,
        error: (statuses.error || 0) + 1,
      };
    }
  }

  console.log("");
  console.log("Statistics");
  Object.keys(statuses).map((status) => console.log(status, statuses[status]));
};

const applyModifiers = (file, fn, data, ...params) => {
  if (data && typeof fn === "function") {
    const fileContent = fn(data, ...params);
    fs.writeFileSync(file, fileContent);
  }
};

module.exports = {
  scrapper,
};
