'use strict';

var path = require('path');
var test = require('ava');
var Promise = require('bluebird');
var retry = require('bluebird-retry');
var createSquirrel = require('..');
var createEtcdDriver = require('../etcd-driver');

var retryOptions = {
    max_tries: -1,
    interval: 10,
    timeout: 2000
};

function generatePath() {
    return path.join(
        '/test',
        Date.now().toString(),
        Math.random().toString().slice(2),
        'folder'
    );
}

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
        key: 'foo',
        value: {
            name: 'foo',
            host: 'foo.bar.baz'
        }
    };

    return squirrel.getBy('name', brand.value.name).then(function(value) {
        t.same(value, null);

        return retry(function() {
            return squirrel.getStore().then(function(node) {
                if (node.nodes.length > 0)
                    return Promise.reject(new Error('retry'));
                return Promise.resolve();
            })
        }, retryOptions);
    }).then(function() {
        return driver.set(brand.key, brand.value);
    }).then(function() {
        return retry(function() {
            return squirrel.getBy('name', brand.value.name).then(function(value) {
                if (!value)
                    return Promise.reject(new Error('retry'));
                return Promise.resolve();
            });
        }, retryOptions);
    }).then(function() {
        return squirrel.getBy('name', brand.value.name);
    }).then(function(value) {
        t.same(value, brand.value);
        return driver.del(brand.key);
    }).then(function() {
        return retry(function() {
            return squirrel.getBy('name', brand.value.name).then(function(value) {
                if (value && value.name)
                    return Promise.reject(new Error('retry'));
                return Promise.resolve();
            });
        }, retryOptions);
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
