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

var generatePath = function() {
    return path.join(
        '/test',
        Date.now().toString(),
        Math.random().toString().slice(2),
        'folder'
    );
};

test('should sync squirrel', function(t) {
    var cwd = generatePath();

    var squirrel = createSquirrel({
        cwd: cwd,
        indexes: ['name']
    });
    var syncer = createEtcdDriver({
        cwd: cwd,
        indexes: ['name']
    });

    var brand = {
        key: 'foo',
        value: {
            name: 'foo',
            host: 'foo.bar.baz'
        }
    };

    t.same(squirrel.getBy('name', brand.value.name), null);
    return syncer.set(brand.key, brand.value).then(function() {
        return retry(function() {
            if (!squirrel.getBy('name', brand.value.name))
                return Promise.reject(new Error('retry'));
            return Promise.resolve();
        }, retryOptions);
    }).then(function() {
        t.same(squirrel.getBy('name', brand.value.name), brand.value);
        return syncer.del(brand.value.name);
    }).then(function() {
        return retry(function() {
            if (squirrel.getBy('name', brand.value.name))
                return Promise.reject(new Error('retry'));
            return Promise.resolve();
        }, retryOptions);
    }).then(function() {
        t.same(squirrel.getBy('name', brand.value.name), null);
    });
});

test('should override mock', function(t) {
    var cwd = generatePath();

    var foo = {
        key: 'foo',
        value: {
            foo: 'bar'
        }
    };

    var squirrel = createSquirrel({
        cwd: cwd,
        mock: [foo]
    });
    t.same(squirrel.getStore(), {foo: foo.value});
    return retry(function() {
        if (Object.keys(squirrel.getStore()).length > 0)
            return Promise.reject(new Error('retry'));
        return Promise.resolve();
    }, retryOptions).then(function() {
        t.same(squirrel.getStore(), {});
    });
});
