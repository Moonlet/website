const URL = require('url');

const urlMap = {};

const urlQueueHistory = [];
const urlQueue = [];
let urlFilter;

const push = (urlList, parentUrl) => {
    urlList = urlList.map(url => fixUrl(url, parentUrl))
    if (urlFilter) {
        urlList = urlList.filter(urlFilter);
    }

    for (const url of urlList) {
        if (!urlMap[url]) {
            urlMap[url] = {
                url,
                fileName: getFilename(url)
            };
            urlQueue.push(url);
        }
    }

    // console.log(urlMap);
}

const getNext = () => {
    const next = urlQueue.shift();
    urlQueueHistory.push(next);
    return next;
}

const getUrl = (url) => {
    return urlMap[url];
}

const setUrlFilter = (fn) => {
    if (typeof fn === 'function') {
        urlFilter = fn;
    }
}

const fixUrl = (url, parent) => {
    let oldUrl = url = url.replace(/^\/\//,'https://');
    parent = URL.parse(parent || "");
    url = URL.parse(url);

    ['protocol', 'host'].map(prop => {
        if (!url[prop] && parent[prop]) {
            url[prop] = parent[prop];
        }
    });

    if (!url.pathname && parent.pathname) {
        url.pathname = parent.pathname;
    }

    if (!url.pathname) {
        url.pathname = '/';
    }

    // remove .. and . from pathname
    if (!url.pathname.startsWith('/')) {
        let path = parent.pathname.split('/');
        // if parent is a file remove the file from path
        if (parent.pathname.match(/.*\.[a-z0-9]*$/)) {
            path.pop();
        }
        path.push(...url.pathname.split('/'));
        url.pathname = path
            .filter(Boolean)
            .reduce((acc, p) => {
                if (p === '.') return acc;
                if (p === '..') {
                    acc.pop();
                    return acc;
                }
                acc.push(p);
                return acc;
            }, [])
            .join('/');
    }

    url.hash = null;
    
    //console.log(URL.format(parent), oldUrl, URL.format(url));
    return URL.format(url);
}

const getFilename = (url) => {
    url = URL.parse(url);

    let file = url.pathname || "/";
    // check if there is an extension present
    if (!file.match(/.*\.[a-z0-9]*$/)) {
        if (file[file.length - 1] !== '/') {
            file += '/';
        }
        file += 'index.html';
    }
    return file;
}

module.exports = {
    push,
    getNext,
    getUrl,
    setUrlFilter
}