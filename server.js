var pixie = require('koa-pixie-proxy');
var router = require('koa-router')();
var serve = require('koa-static');
var logger = require('koa-logger');
var body = require('koa-body');
var koa = require('koa');

var app = koa();

var proxy = pixie({host: 'http://localhost:7474'});

router.all(/^\/db\/data\/.*/,
  proxy(),
  function *(next) {
    console.log("proxying ", this.path);
  }
);
router.redirect('/db/data', '/db/data/');

router.get(/^\/.*$/,
  function *(next) {
    console.log("serving ", this.path);
    yield next;
  },
  serve('./dist/')
);

app
  .use(logger())
  .use(body())
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(9000);

console.log('listening on port 9000');
