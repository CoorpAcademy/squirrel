'use strict';

var test = require('ava');
var _ = require('lodash/fp');
var Promise = require('bluebird');
var httpProxy = require('http-proxy');
var createEtcdDriver = require('../etcd-driver');
var generateCwd = require('./helpers/generate-cwd');

var PORT = 42379;
test.beforeEach('create proxy', function(t) {
    var proxy = httpProxy.createProxyServer({target:'http://localhost:2379'});
    var port = PORT++;
    t.context.proxy = {
        listen: function(cb) {
            proxy.listen(port, cb);
        },
        close: function() {
            proxy.close();
        },
        host: 'http://localhost:' + port
    };
});

test.afterEach('close proxy', function(t) {
    t.context.proxy.close();
});

test('should resync', function(t) {
    var cwd = generateCwd();

    var driver = createEtcdDriver({
        cwd: cwd
    });

    return Promise.fromCallback(function(cb) {
        driver.watch({
            resync: function(err) {
                cb(err);
            }
        });

        Promise.all(_.map(function(value) {
            return driver.set('/foo', value.toString());
        }, _.range(0, 1200)));
    });
});

test('should reconnect', function(t) {
    var cwd = generateCwd();

    return Promise.fromCallback(function(cb) {
        t.context.proxy.listen(cb);
    }).then(function() {
        var driver = createEtcdDriver({
            cwd: cwd,
            hosts: t.context.proxy.host
        });

        return Promise.fromCallback(function(cb) {
            driver.watch({
                reconnect: cb
            });

            t.context.proxy.close();
        });
    });
});
