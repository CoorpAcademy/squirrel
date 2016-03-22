'use strict';

var path = require('path');
var test = require('ava');
var Promise = require('bluebird');
var createSquirrel = require('..');
var createEtcdDriver = require('../etcd-driver');


function generatePath() {
    return path.join(
        '/test',
        Date.now().toString(),
        Math.random().toString().slice(2),
        'folder'
    );
}

var TIMEOUT = 100;

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
        return driver.set('yolo/127', {
            name: 'blue'
        });
    }).then(function() {
        return new Promise(function(resolve) {
            setTimeout(resolve, TIMEOUT);
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
        return new Promise(function(resolve) {
            setTimeout(resolve, TIMEOUT);
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
        return new Promise(function(resolve) {
            setTimeout(resolve, TIMEOUT);
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
        return new Promise(function(resolve) {
            setTimeout(resolve, TIMEOUT);
        });
    }).then(function() {
        return squirrel.get('/foo/bar');
    }).then(function(node) {
        t.is(node, null);
    });
});
