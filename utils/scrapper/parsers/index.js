String.prototype.matchAll = function(regexp) {
    var matches = [];
    this.replace(regexp, function() {
      var arr = ([]).slice.call(arguments, 0);
      var extras = arr.splice(-2);
      arr.index = extras[0];
      arr.input = extras[1];
      matches.push(arr);
    });
    return matches.length ? matches : null;
  };

module.exports = {
    html: require('./html'),
    css: require('./css')
}