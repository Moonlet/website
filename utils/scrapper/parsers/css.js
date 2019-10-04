module.exports = (cssText) => {
    const out = {
        resources: getResources(cssText)
    };

    return out;
}

const getResources = (cssText) => {
    let resources = [];
    let re = /url\(\\?"?'?([^\)'\\"]*)\\?'?"?\)/gi;

    let matches = (cssText || "").matchAll(re) || [];
    for (const match of matches) {
        if (Array.isArray(match) && match[1]) {
            resources.push(match[1]);
        }
        //console.log(match);
    }

    //console.log(resources);
    return resources;
}