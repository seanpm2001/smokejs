/*global module */
'use strict';

module.exports = (function() {
  var marked = require('marked');
   
  var renderer = new marked.Renderer();
  renderer.component_block = function (that) {
    //Return component html here
    // that.token.slug is the slug of the content
    // If we need more info we can pass it down.
    return that.token.slug;
  };
  var options = {
    'renderer': renderer,
    'extra_block_rules': {
      //Looks for pattern !!() we can switch to !!()[args] later
      component_block: /^!!\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]/
    },
    'extra_block_lexers': {
      component_block: function (cap) {
        return {
          type: 'component_block',
          slug: cap[1]
        };
      }
    }
  };
  marked.setOptions(options);
  var markdown = {
    toHTML: marked,
    lexer: function (md) {
      return marked.lexer(md, options);
    },
    parser: marked.parser
  };

  return markdown;

})();
