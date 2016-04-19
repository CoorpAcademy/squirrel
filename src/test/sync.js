'use strict';

var path = require('path');
var test = require('ava');
var Promise = require('bluebird');
var createSquirrel = require('..');
var createEtcdDriver = require('../etcd-driver');
var retry = require('./helpers/retry');
var generateCwd = require('./helpers/generate-cwd');

test('should sync squirrel', function(t) {
    var cwd = generateCwd();

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
        t.deepEqual(value, null);
        return driver.set(brand.key, brand.value);
    }).then(function() {
        return retry(squirrel, brand.key, function(node) {
            return node.value.name === brand.value.name;
        });
    }).then(function() {
        return squirrel.getBy('name', brand.value.name);
    }).then(function(value) {
        t.deepEqual(value, brand.value);
        return driver.del(brand.key);
    }).then(function() {
        return retry(squirrel, brand.key, function(node) {
            return node === null;
        });
    }).then(function() {
        return squirrel.getBy('name', brand.value.name);
    }).then(function(value) {
        t.deepEqual(value, null);
    });
});

test('should override fallback', function(t) {
    var overridedsquirrel = createSquirrel({
        cwd: generateCwd(),
        fallback: path.join(__dirname, 'fixtures/sync.json')
    });

    var squirrel = createSquirrel({
        cwd: generateCwd(),
        fallback: path.join(__dirname, 'fixtures/sync.json'),
        fetch: false
    });

    return Promise.all([
        overridedsquirrel.getStore().then(function(node) {
            t.deepEqual(node.nodes, []);
        }),
        squirrel.getStore().then(function(node) {
            t.is(node.nodes.length, 2);
        })
    ]);
});
