'use strict';

var path = require('path');
var test = require('ava');
var createSquirrel = require('..');

var generatePath = function() {
    return path.join(
        '/test',
        Date.now().toString(),
        Math.random().toString().slice(2),
        'folder'
    );
};

var brandFoo = {
    'key': 'foo',
    'value': {
        'host': 'foo.coorpacademy.com',
        'name': 'foo',
        'meta': {
            'foo': 'bar'
        }
    }
};

var brandBar = {
    'key': 'bar',
    'value': {
        'host': 'bar.coorpacademy.com',
        'name': 'bar',
        'meta': {
            'foo': 'baz'
        }
    }
};

test('should find by name', function(t) {
    var squirrel = createSquirrel({
        cwd: generatePath(),
        mock: [brandFoo, brandBar],
        fetch: false,
        indexes: ['name']
    });

    t.same(squirrel.getBy('name', 'foo'), brandFoo.value);
    t.same(squirrel.getBy('name', 'bar'), brandBar.value);
    t.same(squirrel.getBy('name', 'baz'), null);
});

test('should find by host', function(t) {
    var squirrel = createSquirrel({
        cwd: generatePath(),
        mock: [brandFoo, brandBar],
        fetch: false,
        indexes: ['host']
    });

    t.same(squirrel.getBy('host', 'foo.coorpacademy.com'), brandFoo.value);
    t.same(squirrel.getBy('host', 'bar.coorpacademy.com'), brandBar.value);
    t.same(squirrel.getBy('host', 'baz.coorpacademy.com'), null);
});

test('should get all names', function(t) {
    var squirrel = createSquirrel({
        cwd: generatePath(),
        mock: [brandFoo, brandBar],
        fetch: false,
        indexes: ['name']
    });

    t.same(squirrel.getAll('name'), ['foo', 'bar']);

    var emptySquirrel = createSquirrel({
        cwd: generatePath()
    });
    t.same(emptySquirrel.getAll('name'), []);
});

test('should get all meta.foo', function(t) {
    var squirrel = createSquirrel({
        cwd: generatePath(),
        mock: [brandFoo, brandBar],
        fetch: false,
        indexes: ['meta.foo']
    });

    t.same(squirrel.getAll('meta.foo'), ['bar', 'baz']);

    var emptySquirrel = createSquirrel({
        cwd: generatePath()
    });
    t.same(emptySquirrel.getAll('meta.foo'), []);
});
