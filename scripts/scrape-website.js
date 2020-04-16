const evilDns = require("evil-dns");
const { scrapper } = require("../utils/scrapper");

// String match
evilDns.add("wp.moonlet.xyz", "212.146.84.81");

const urlFix = (data) => {
  return data.replace(/wp\.moonlet\.xyz/gi, "moonlet.io");
};

scrapper({
  urls: [
    "https://wp.moonlet.xyz",
    "https://wp.moonlet.xyz/404.html",
    "https://wp.moonlet.xyz/favicon.ico",

    "https://wp.moonlet.xyz/thank-you/",
    "https://wp.moonlet.xyz/thank-you-update/",
    "https://wp.moonlet.xyz/thank-you-delete/",

    "https://wp.moonlet.xyz/wp-content/plugins/gdpr-cookie-compliance/dist/scripts/lity.js",
  ],
  dest: "./website/moonlet.xyz",
  urlFilter: (url) => (url || "").startsWith("https://wp.moonlet.xyz"),
  fileModifiers: {
    html: urlFix,
    css: urlFix,
    js: urlFix,
  },
});
