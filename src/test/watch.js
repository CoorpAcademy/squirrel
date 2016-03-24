'use strict';

var path = require('path');
var test = require('ava');
var createSquirrel = require('..');
var createEtcdDriver = require('../etcd-driver');
var retry = require('../util/test').retry;
var generatePath = require('../util/test').generatePath;

test('should watch set file', function(t) {
    var cwd = generatePath();

    var squirrel = createSquirrel({
        cwd: cwd,
        fallback: path.join(__dirname, './watch.json'),
        fetch: false,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    return squirrel.getStore().then(function(store) {
        return driver.set('/yolo/127', {
            name: 'blue'
        });
    }).then(function() {
        return retry(squirrel, '/yolo/127', function(node) {
            return node.value !== null;
        });
    }).then(function() {
        return squirrel.getBy('name', 'blue');
    }).then(function(node) {
        t.same(node, {
            name: 'blue'
        });
    });
});

test('should watch add directory', function(t) {
    var cwd = generatePath();

    var squirrel = createSquirrel({
        cwd: cwd,
        fallback: path.join(__dirname, './watch.json'),
        fetch: false,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    return squirrel.getStore().then(function(store) {
        return driver.mkdir('/foo/bar');
    }).then(function() {
        return retry(squirrel, '/foo/bar', function(node) {
            return node !== null;
        });
    }).then(function() {
        return squirrel.get('/foo/bar');
    }).then(function(node) {
        t.same(node.nodes, []);
    });
});

test('should watch remove directory', function(t) {
    var cwd = generatePath();

    var squirrel = createSquirrel({
        cwd: cwd,
        fallback: path.join(__dirname, './watch.json'),
        fetch: false,
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
    var cwd = generatePath();

    var squirrel = createSquirrel({
        cwd: cwd,
        fallback: path.join(__dirname, './watch.json'),
        fetch: false,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    return squirrel.getStore().then(function(store) {
        return driver.set('/foo/bar', { name: 'foo' });
    }).then(function() {
        return driver.del('/foo/bar');
    }).then(function() {
        return retry(squirrel, '/foo/bar', function(node) {
            return node === null;
        });
    }).then(function() {
        return squirrel.get('/foo/bar');
    }).then(function(node) {
        t.is(node, null);
    });
});
