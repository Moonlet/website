const cheerio = require('cheerio');
const cssParser = require('./css');
const isUrl = require('../utils/is-url');

module.exports = (htmlText) => {
    const $ = cheerio.load(htmlText);

    const out = {
        links: getLinks($),
        images: getImages($),
        js: getJsFiles($),
        css: getCssFiles($),
    };

    return out;
}

const getCssFiles = ($) => {
    let files = [];
    $('link').each((index, element) => {
        let href = $(element).attr('href');
        if (href) {
            files.push(href);
        }
    });

    // parse comments
    var $comments = $("*").contents().filter(function () {
        return this.nodeType === 8;
    });
    $comments.each(function(){
        let comment = this.data.toLowerCase();
        let matches = (comment.matchAll(/<link(( ?(\w+)="([^"]+)")*)>/ig) || []);
        for(const match of matches) {
            if (Array.isArray(match)) {
                const paramsString = match[1];
                const paramsArray = (paramsString || "").matchAll(/(\w+)="([^"]+)/ig);
                for(const param of paramsArray) {
                    if (Array.isArray(param) && param[1] === 'href' && param[1]) {
                        files.push(param[2]);
                    }
                }
            }
        }
    });

    return files;
}

const getJsFiles = ($) => {
    const files = [];
    $('script').each((index, element) => {
        let src = $(element).attr('src');
        if (src) {
            files.push(src);
        }
    });
    return files;
} 

const getLinks = ($) => {
    const links = [];

    $('a').each((index, element) => {
        let href = $(element).attr('href');

        if (href) {
            links.push(href);
        }
    });

    return links;
}

const getImages = ($) => {
    const images = [];

    $('img').each((index, element) => {
        $el = $(element);

        let src = $el.attr('src');
        if (src) {
            images.push(src);
        }

        let srcSet = $el.attr('srcset');
        if (srcSet) {
            //console.log(srcSet);
            let imgs = srcSet.split(',').map(a => a.trim().split(' ')[0]);
            images.push(...imgs);
        }
    });

    // get resources from inline styles tags
    $('style').each((index, element) => {
        let {resources} = cssParser($(element).html());
        images.push(...resources);
    });
    
    // get resources from inline style
    $("*").each((index, element) => {
        let style = $(element).attr('style');
        if (style) {
            let {resources} = cssParser(style);
            images.push(...resources);
        }
    });

    // get meta content
    $('meta').each((index, element) => {
        let content = $(element).attr('content');
        if (content && isUrl(content)) {
            images.push(content);
        }
    });

    return images;
}