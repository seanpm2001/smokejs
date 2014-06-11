'use strict';
//FIXME: make templates built outside of build
var Dust = require('../build/js/dust_templates')();
var api = require('./api');
var EnvConfig = require('./config');
var Markdown = require('./markdown');
var Ad = require('./ad');
var Promise = require('promise-polyfill');

exports.render = function(template, data, callback) {
  var promise = new Promise(function(resolve, reject) {
    var context = exports.dustBase().push(data);
    Dust.render(template, context,
      function(err, out) {  //callback
        if (err) {
          EnvConfig.ERROR_HANDLER(err, this);
          reject();
        }
        callback(out);
        resolve();
      }
    );
  });
  return promise;
};

exports.dustBase = function() {
  return Dust.makeBase({
    mediaBase : EnvConfig.MEDIA_STORE,
    load:  function(chunk, context, bodies, params) {
      var slug = params.slug ? params.slug : params.id;
      return chunk.map(function(chunk) {
        var component = new api.Component(slug);
        component.get(function(data) {
          var template = params.template ? params.template : data.schema_name;
          exports.render(template, data, function(html) {
            chunk.end(html);
          });
        });
      });
    },
    ad:  function(chunk, context, bodies, params) {
      return chunk.map(function(chunk) {
        Ad.currentAds[params.placement] = true;
        params.src = Ad.getSrc(params.placement);
        exports.render('ad_iframe', params, function(html) {
          chunk.end(html);
        });
      });
    },
         /* IMPORTANT! THIS USES CONTEXT, YOU PROBABLY WANT LOAD */
    render:  function(chunk, context, bodies, params) {
      return chunk.map(function(chunk) {
        exports.render(params.template, context.stack.head, function(html) {
          chunk.end(html);
        });
      });
    },
    markdown:  function(chunk, context, bodies, params) {
      return chunk.map(function(chunk) {
            chunk.end('we need to fix the fixture server');
            console.log(Markdown, chunk, context, bodies, params);
        /*
        api.component(params.data_uri, function(data) {
          var html = Markdown.toHTML(data);
          // do we need a better way of making a random name?
          var templateName = 'markdown_' + Math.random();
          var template = Dust.compile(html, templateName);
          Dust.loadSource(template);
          exports.render(templateName, data, function(html) {
            chunk.end(html);
          });
        });
        */
      });
    },
  });
};