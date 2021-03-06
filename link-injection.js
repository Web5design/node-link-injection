(function() {
  var cheerio, defaults, makeRegex, parse, _;

  cheerio = require('cheerio');

  _ = require('underscore');

  makeRegex = function(keyword, options) {
    var flags;
    flags = 'g';
    if (!options.caseSensitive) flags += 'i';
    return new RegExp("\\b(" + keyword + ")\\b", flags);
  };

  defaults = {
    caseSensitive: true,
    repeat: 0
  };

  parse = function(text, map, options) {
    var $, countMap, descend, keywords, output, regexMap, replace;
    if (text == null) text = '';
    if (map == null) map = {};
    options = _.extend({}, defaults, options != null ? options : {});
    keywords = Object.keys(map);
    regexMap = {};
    countMap = {};
    output = '';
    $ = cheerio.load("<div class='link-injection-tag-class'>" + text + "</div>");
    keywords.forEach(function(keyword) {
      regexMap[keyword] = makeRegex(keyword, options);
      return countMap[keyword] = 0;
    });
    descend = function($el) {
      var $children;
      if ($el[0].type === 'tag' && $el[0].name === 'a') return;
      $children = $el.children();
      $children.each(function() {
        return descend($(this));
      });
      return $el[0].children.forEach(function(node) {
        if (node.type === 'text') return node.data = replace(node.data);
      });
    };
    replace = function(text) {
      _.each(regexMap, function(regex, keyword) {
        while (regex.test(text) && (countMap[keyword] < options.repeat || options.repeat === 0)) {
          text = text.replace(regex, "<a href='" + map[keyword] + "' title='" + keyword + "'>$1</a>");
          countMap[keyword]++;
          if (options.repeat === 0) break;
        }
        return countMap[keyword] = 0;
      });
      return text;
    };
    descend($('.link-injection-tag-class'));
    return $('.link-injection-tag-class').html();
  };

  module.exports = {
    parse: parse
  };

}).call(this);
