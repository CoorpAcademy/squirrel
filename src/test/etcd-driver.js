'use strict';

var Promise = require('bluebird');
var test = require('ava');
var createEtcdDriver = require('../etcd-driver');
var generateCwd = require('./helpers/generate-cwd');

test.beforeEach(function(t) {
    t.context.cwd = generateCwd();
});

test('should create etcd driver', function(t) {
    var driver = createEtcdDriver({
        cwd: t.context.cwd
    });

    return driver.list().then(function(node) {
        t.same(node.nodes, []);
    });
});

test('should get node', function(t) {
    var driver = createEtcdDriver({
        cwd: t.context.cwd
    });

    return driver.get('/').then(function(node) {
        t.is(node.key, '/');
    });
});

test('should get root', function(t) {
    var driver = createEtcdDriver({
        cwd: '/'
    });

    return driver.get('/').then(function(node) {
        t.is(node.key, '/');
    });
});

test('should fetch folder content', function(t) {
    var driver = createEtcdDriver({
        cwd: t.context.cwd
    });

    return driver.set('/foo', {
        foo: 'foo'
    }).then(function() {
        return driver.list();
    }).then(function(node) {
        return node.nodes.map(function(node) {
            return node.value;
        });
    }).then(function(nodes) {
        t.same(nodes, [{
            foo: 'foo'
        }]);
    });
});

test('should watch set', function(t) {
    var driver = createEtcdDriver({
        cwd: t.context.cwd
    });

    return Promise.fromCallback(function(cb) {
        driver.watch({
            set: function(err, node) {
                if (node.dir) return;
                t.same(node.key, '/foo');
                t.same(node.value, 'bar');
                cb();
            }
        });

        driver.set('/foo', 'bar');
    });
});

test('should watch delete', function(t) {
    var driver = createEtcdDriver({
        cwd: t.context.cwd
    });

    return Promise.fromCallback(function(cb) {
        driver.watch({
            delete: function(err, node) {
                t.same(node.key, '/foo');
                t.same(node.value);
                cb();
            }
        });

        driver.set('/foo', 'bar').then(function() {
            return driver.del('/foo', 'bar');
        });
    });
});
