'use strict';

var path = require('path');
var test = require('ava');
var Promise = require('bluebird');
var createSquirrel = require('..');
var createEtcdDriver = require('../etcd-driver');
var retry = require('../util/test').retry;
var generatePath = require('../util/test').generatePath;

test('should sync squirrel', function(t) {
    var cwd = generatePath();

    var squirrel = createSquirrel({
        cwd: cwd,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    var brand = {
        key: '/foo',
        value: {
            name: 'foo',
            host: 'foo.bar.baz'
        }
    };

    return squirrel.getBy('name', brand.value.name).then(function(value) {
        t.same(value, null);
        return driver.set(brand.key, brand.value);
    }).then(function() {
        return retry(squirrel, brand.key, function(node) {
            return node.value.name === brand.value.name;
        });
    }).then(function() {
        return squirrel.getBy('name', brand.value.name);
    }).then(function(value) {
        t.same(value, brand.value);
        return driver.del(brand.key);
    }).then(function() {
        return retry(squirrel, brand.key, function(node) {
            return node === null;
        });
    }).then(function() {
        return squirrel.getBy('name', brand.value.name);
    }).then(function(value) {
        t.same(value, null);
    });
});

test('should override fallback', function(t) {
    var overridedsquirrel = createSquirrel({
        cwd: generatePath(),
        fallback: path.join(__dirname, './sync.json')
    });

    var squirrel = createSquirrel({
        cwd: generatePath(),
        fallback: path.join(__dirname, './sync.json'),
        fetch: false
    });

    return Promise.all([
        overridedsquirrel.getStore().then(function(node) {
            t.same(node.nodes, []);
        }),
        squirrel.getStore().then(function(node) {
            t.is(node.nodes.length, 2);
        })
    ]);
});
