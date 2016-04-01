'use strict';

var test = require('ava');
var createSquirrel = require('..');
var createEtcdDriver = require('../etcd-driver');
var retry = require('./helpers/retry');
var generateCwd = require('./helpers/generate-cwd');

test.beforeEach(function(t) {
    t.context.cwd = generateCwd();
});

test('should watch set file', function(t) {
    var cwd = t.context.cwd;

    var squirrel = createSquirrel({
        cwd: cwd,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    return squirrel.getStore().then(function(store) {
        return driver.set('/foo', {
            name: 'foo'
        });
    }).then(function() {
        return retry(squirrel, '/foo', function(node) {
            return node.value !== null;
        });
    }).then(function() {
        return squirrel.getBy('name', 'foo');
    }).then(function(node) {
        t.same(node, {
            name: 'foo'
        });
    });
});

test('should watch add directory', function(t) {
    var cwd = t.context.cwd;

    var squirrel = createSquirrel({
        cwd: cwd,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    return squirrel.getStore().then(function(store) {
        return driver.mkdir('/foo');
    }).then(function() {
        return retry(squirrel, '/foo', function(node) {
            return node !== null;
        });
    }).then(function() {
        return squirrel.get('/foo');
    }).then(function(node) {
        t.same(node.nodes, []);
    });
});

test('should watch remove directory', function(t) {
    var cwd = t.context.cwd;

    var squirrel = createSquirrel({
        cwd: cwd,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    return squirrel.getStore().then(function(store) {
        return driver.set('/foo/bar', { name: 'foo' });
    }).then(function() {
        return driver.rmdir('/foo');
    }).then(function() {
        return retry(squirrel, '/foo/bar', function(node) {
            return node === null;
        });
    }).then(function() {
        return squirrel.get('/foo');
    }).then(function(node) {
        t.is(node, null);
    });
});

test('should watch remove file', function(t) {
    var cwd = t.context.cwd;

    var squirrel = createSquirrel({
        cwd: cwd,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    return squirrel.getStore().then(function(store) {
        return driver.set('/foo', { name: 'foo' });
    }).then(function() {
        return retry(squirrel, '/foo', function(node) {
            return node !== null;
        });
    }).then(function() {
        return driver.del('/foo');
    }).then(function() {
        return retry(squirrel, '/foo', function(node) {
            return node === null;
        });
    }).then(function() {
        return squirrel.get('/foo');
    }).then(function(node) {
        t.is(node, null);
    });
});
