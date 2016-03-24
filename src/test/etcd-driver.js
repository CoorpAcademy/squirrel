'use strict';

var Promise = require('bluebird');
var test = require('ava');
var createEtcdDriver = require('../etcd-driver');
var generatePath = require('../util/test').generatePath;

test('should create etcd driver', function(t) {
    var driver = createEtcdDriver({
        cwd: generatePath()
    });

    return driver.list().then(function(node) {
        t.same(node.nodes, []);
    });
});

test('should fetch folder content', function(t) {
    var driver = createEtcdDriver({
        cwd: generatePath()
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
        cwd: generatePath()
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
        cwd: generatePath()
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
