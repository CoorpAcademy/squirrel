'use strict';

var path = require('path');
var test = require('ava');
var Promise = require('bluebird');
var httpProxy = require('http-proxy');
var createEtcdDriver = require('../etcd-driver');
var createSquirrel = require('../');
var retry = require('../util/test').retry;
var generatePath = require('../util/test').generatePath;

test('should fetch from server', function(t) {
    var cwd = generatePath();

    var driver = createEtcdDriver({
        cwd: cwd
    });

    return driver.set('/foo', 'foo').then(function() {
        var squirrel = createSquirrel({
            cwd: cwd,
            fallback: path.join(__dirname, './fallback.json')
        });

        return squirrel.get('/foo').then(function(node) {
            t.same(node.value, 'foo');
        });
    });
});

test('should read fallback', function(t) {
    var cwd = generatePath();

    var driver = createEtcdDriver({
        cwd: cwd
    });

    return driver.set('/foo', 'foo').then(function() {
        var squirrel = createSquirrel({
            cwd: cwd,
            fallback: path.join(__dirname, './fallback.json'),
            fetch: false
        });

        return squirrel.get('/foo').then(function(node) {
            t.same(node.value, 'bar');
        });
    });
});

var PORT = 41379;
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

test('should restore fallback if etcd is unavailable', function(t) {
    var cwd = generatePath();

    var driver = createEtcdDriver({
        cwd: cwd
    });

    return driver.set('/foo', 'foo').then(function() {
        var squirrel = createSquirrel({
            cwd: cwd,
            fallback: path.join(__dirname, './fallback.json'),
            hosts: t.context.proxy.host
        });

        return squirrel.get('/foo').then(function(node) {
            t.same(node.value, 'bar');
        });
    });
});

test('should restore fallback if etcd is unavailable', function(t) {
    var cwd = generatePath();

    var driver = createEtcdDriver({
        cwd: cwd
    });

    return driver.set('/foo', 'foo').then(function() {
        var squirrel = createSquirrel({
            cwd: cwd,
            fallback: path.join(__dirname, './fallback.json'),
            hosts: t.context.proxy.host
        });

        return squirrel.get('/foo').then(function(node) {
            t.same(node.value, 'bar');
        }).then(function() {
            return Promise.fromCallback(t.context.proxy.listen);
        }).then(function() {
            return retry(squirrel, '/foo', function(node) {
                return node.value !== 'bar';
            });
        }).then(function(node) {
            t.same(node.value, 'foo');
        });
    });
});