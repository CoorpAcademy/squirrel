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

function generateMock(cwd, values) {
    return {
        key: cwd,
        dir: true,
        nodes: values
    };
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

    t.same(squirrel.getBy('name', brand.value.name), null);
    return retry(function() {
        if (!squirrel.getStore().nodes)
            return Promise.reject(new Error('retry'));
        return Promise.resolve();
    }, retryOptions).then(function() {
        return driver.set(brand.key, brand.value);
    }).then(function() {
        return retry(function() {
            if (!squirrel.getBy('name', brand.value.name))
                return Promise.reject(new Error('retry'));
            return Promise.resolve();
        }, retryOptions);
    }).then(function() {
        t.same(squirrel.getBy('name', brand.value.name), brand.value);
        return driver.del(brand.value.name);
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

test('should deep sync squirrel', function(t) {
    var cwd = generatePath();

    var squirrel = createSquirrel({
        cwd: cwd,
        indexes: ['name']
    });
    var driver = createEtcdDriver({
        cwd: cwd
    });

    var brand = {
        key: 'foo/bar',
        value: {
            name: 'foo',
            host: 'foo.bar.baz'
        }
    };

    t.same(squirrel.getBy('name', brand.value.name), null);
    return retry(function() {
        if (!squirrel.getStore().nodes)
            return Promise.reject(new Error('retry'));
        return Promise.resolve();
    }, retryOptions).then(function() {
        return driver.set(brand.key, brand.value);
    }).then(function() {
        return retry(function() {
            if (!squirrel.getBy('name', brand.value.name))
                return Promise.reject(new Error('retry'));
            return Promise.resolve();
        }, retryOptions);
    }).then(function() {
        t.same(squirrel.getBy('name', brand.value.name), brand.value);
        return driver.del(brand.key);
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
    var foo = {
        key: 'foo',
        value: {
            foo: 'bar'
        }
    };

    var cwd = generatePath();
    var mock = generateMock(cwd, [foo]);

    var squirrel = createSquirrel({
        cwd: cwd,
        mock: mock
    });
    t.is(squirrel.getStore(), mock);
    return retry(function() {
        if (squirrel.getStore() === mock)
            return Promise.reject(new Error('retry'));
        return Promise.resolve();
    }, retryOptions).then(function() {
        t.not(squirrel.getStore(), mock);
    });
});
