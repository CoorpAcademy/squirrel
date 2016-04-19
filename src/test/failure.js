'use strict';

var test = require('ava');
// var _ = require('lodash/fp');
// var Promise = require('bluebird');
var httpProxy = require('http-proxy');
// var createEtcdDriver = require('../etcd-driver');
// var createSquirrel = require('../');
// var generateCwd = require('./helpers/generate-cwd');
// var retry = require('./helpers/retry');

var PORT = 42379;
test.beforeEach('create proxy', function(t) {
    var proxy = httpProxy.createProxyServer({
        target: 'http://localhost:2379'
    });
    var port = PORT++;
    t.context.proxy = {
        listen: function(cb) {
            proxy.listen(port, cb);
        },
        close: function(cb) {
            proxy.close(cb);
        },
        host: 'http://localhost:' + port
    };
});

test.afterEach('close proxy', function(t) {
    t.context.proxy.close();
});

test('should pass', function() {});

// test('should emit resync', function(t) {
//     var cwd = generateCwd();

//     var driver = createEtcdDriver({
//         cwd: cwd
//     });

//     var squirrel = createSquirrel({
//         cwd: cwd
//     });

//     return Promise.fromCallback(function(cb) {
//         driver.watch({
//             resync: function(err) {
//                 cb(err);
//             }
//         });

//         Promise.all(_.map(function(value) {
//             return driver.set('/foo', value.toString());
//         }, _.range(0, 1200)));
//     }).then(function() {
//         return retry(squirrel, '/foo', function(node) {
//             return node.value === '1199';
//         });
//     });
// });

// test('should emit reconnect', function(t) {
//     var cwd = generateCwd();

//     return Promise.fromCallback(function(cb) {
//         t.context.proxy.listen(cb);
//     }).then(function() {
//         var driver = createEtcdDriver({
//             cwd: cwd,
//             hosts: t.context.proxy.host
//         });

//         var squirrel = createSquirrel({
//             cwd: cwd,
//             hosts: t.context.proxy.host
//         });

//         var backup = createEtcdDriver({
//             cwd: cwd
//         });

//         return Promise.all([
//             Promise.fromCallback(function(cb) {
//                 driver.watch({
//                     reconnect: function(err) {
//                         cb();
//                     }
//                 });
//             }),
//             retry(squirrel, '/foo', function(node) {
//                 return node.value === 'yolo';
//             }),
//             new Promise(function(resolve, reject) {
//                 t.context.proxy.close(function() {
//                     backup.set('/foo', 'yolo').then(resolve, reject);
//                 });
//             }).then(function() {
//                 setTimeout(function() {
//                     t.context.proxy.listen();
//                 }, 10);
//             })
//         ]);
//     });
// });
