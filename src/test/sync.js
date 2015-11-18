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
    timeout: 30000
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
        name: 'foo',
        host: 'foo.bar.baz'
    };

    t.same(squirrel.getBy('name', brand.name), null);
    return syncer.set(brand.name, brand).then(function() {
        return retry(function() {
            if(!squirrel.getBy('name', brand.name))
                return Promise.reject(new Error('retry'));
            return Promise.resolve();
        }, retryOptions);
    }).then(function() {
        t.same(squirrel.getBy('name', brand.name), brand);
        return syncer.del(brand.name);
    }).then(function() {
        return retry(function() {
            if(squirrel.getBy('name', brand.name))
                return Promise.reject(new Error('retry'));
            return Promise.resolve();
        }, retryOptions);
    }).then(function() {
        t.same(squirrel.getBy('name', brand.name), null);
    });
});

test('should override mock', function(t) {
    var cwd = generatePath();

    var mock = [{foo: 'bar'}];

    var squirrel = createSquirrel({
        cwd: cwd,
        mock: [{foo: 'bar'}]
    });

    t.same(squirrel.getStore(), mock);
    return retry(function() {
        if(squirrel.getStore().length > 0)
            return Promise.reject(new Error('retry'));
        return Promise.resolve();
    }, retryOptions).then(function() {
        t.same(squirrel.getStore(), []);
    });
});
