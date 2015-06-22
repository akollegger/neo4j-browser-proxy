#!/usr/bin/env node --harmony
var os = require('os');

var pixie = require('koa-pixie-proxy');
var router = require('koa-router')();
var serve = require('koa-static');
var body = require('koa-body');
var koa = require('koa');
var winston = require('winston');
var colors = require('colors/safe');

var argOptions = {
  string: ['neo4j', 'log'],
  boolean: 'silent',
  integer: 'port',
  alias: {
    h: 'help',
    s: 'silent',
    l: 'log',
    n: 'neo4j',
    p: 'port'
  },
  default: {
    'port': 9090,
    'neo4j': 'http://localhost:7474',
    'log': 'verbose',
    'silent': false
  }
};

var argv = require('minimist')(process.argv.slice(2), argOptions);

if (argv.help) {
  var cmd = require('path').basename(process.argv[1]);
  console.log(
    require('fs')
      .readFileSync(__dirname+'/help.txt','utf-8')
      .replace(/\$0/g, cmd)
      .trim());
  process.exit();
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({level: argv.log, silent: argv.silent, colorize:true})
  ]
});


var app = koa();

var proxy = pixie({host: argv.neo4j});

// http logging

function httpLog(action, color) {
  return function *(next) {
    yield next;
    var leveledLog = logger.info;
    switch (this.status) {
      case 200:
      case 201: leveledLog = logger.info; break;
      case 400:
      case 401:
        leveledLog = logger.warn; break;
      case 500:
        leveledLog = logger.error; break;
      default:
        leveledLog = logger.info;
    }
    leveledLog(color(action) + ' %s %s %d', this.method, this.url, this.status);
  }
};

router.all(/^\/db\/data\/.*/,
  proxy(),
  httpLog('PROXY', colors.cyan)
);
router.redirect('/db/data', '/db/data/');

router.get(/^\/.*$/,
  httpLog('SERVE', colors.green),
  serve('./dist/', {defer:true})
);

app
  .use(body())
  .use(router.routes())
  .use(router.allowedMethods())
  ;

app.on('error', function(err){
  log.error(err);
});


app.listen(argv.port);

logger.verbose(colors.green('Neo4j Browser Proxy ') +
  '(http://%s:%d)==>(%s)', os.hostname(), argv.port, argv.neo4j);
