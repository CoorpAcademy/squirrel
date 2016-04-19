'use strict';

var path = require('path');
var test = require('ava');
var generateCwd = require('./helpers/generate-cwd');
var createSquirrel = require('..');

test.beforeEach(function(t) {
    t.context.cwd = generateCwd();
});

test('should find by name', function(t) {
    var squirrel = createSquirrel({
        cwd: t.context.cwd,
        fallback: path.join(__dirname, 'fixtures/indexes.json'),
        fetch: false,
        indexes: ['name']
    });

    return Promise.all([
        squirrel.getBy('name', 'foo').then(function(value) {
            t.deepEqual(value.name, 'foo');
        }),
        squirrel.getBy('name', 'bar').then(function(value) {
            t.deepEqual(value.name, 'bar');
        }),
        squirrel.getBy('name', 'baz').then(function(value) {
            t.deepEqual(value, null);
        })
    ]);
});

test('should find by host', function(t) {
    var squirrel = createSquirrel({
        cwd: t.context.cwd,
        fallback: path.join(__dirname, 'fixtures/indexes.json'),
        fetch: false,
        indexes: ['host']
    });

    return Promise.all([
        squirrel.getBy('host', 'foo.coorpacademy.com').then(function(value) {
            t.deepEqual(value.host, 'foo.coorpacademy.com');
        }),
        squirrel.getBy('host', 'bar.coorpacademy.com').then(function(value) {
            t.deepEqual(value.host, 'bar.coorpacademy.com');
        }),
        squirrel.getBy('host', 'baz.coorpacademy.com').then(function(value) {
            t.deepEqual(value, null);
        })
    ]);
});

test('should find by meta.foo', function(t) {
    var squirrel = createSquirrel({
        cwd: t.context.cwd,
        fallback: path.join(__dirname, 'fixtures/indexes.json'),
        fetch: false,
        indexes: ['meta.foo']
    });

    return Promise.all([
        squirrel.getBy('meta.foo', 'foo').then(function(value) {
            t.deepEqual(value.meta.foo, 'foo');
        }),
        squirrel.getBy('meta.foo', 'bar').then(function(value) {
            t.deepEqual(value.meta.foo, 'bar');
        }),
        squirrel.getBy('meta.foo', 'baz').then(function(value) {
            t.deepEqual(value, null);
        })
    ]);
});

test('should get all names', function(t) {
    var squirrel = createSquirrel({
        cwd: t.context.cwd,
        fallback: path.join(__dirname, 'fixtures/indexes.json'),
        fetch: false,
        indexes: ['name']
    });

    var emptySquirrel = createSquirrel({
        cwd: t.context.cwd,
        fetch: false
    });

    return Promise.all([
        squirrel.getAll('name').then(function(values) {
            t.deepEqual(values, ['foo', 'bar']);
        }),
        emptySquirrel.getAll('name').then(function(values) {
            t.deepEqual(values, []);
        })
    ]);
});

test('should get all meta.foo', function(t) {
    var squirrel = createSquirrel({
        cwd: t.context.cwd,
        fallback: path.join(__dirname, 'fixtures/indexes.json'),
        fetch: false,
        indexes: ['meta.foo']
    });

    var emptySquirrel = createSquirrel({
        cwd: generateCwd(),
        fetch: false
    });

    return Promise.all([
        squirrel.getAll('meta.foo').then(function(values) {
            t.deepEqual(values, ['foo', 'bar']);
        }),
        emptySquirrel.getAll('meta.foo').then(function(values) {
            t.deepEqual(values, []);
        })
    ]);
});
