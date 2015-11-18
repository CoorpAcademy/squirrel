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

var foo = {
    'foo': 'foo',
    'bar': {
        'baz': 'baz'
    }
};

test('should index by first level field', function(t) {
    var squirrel = createSquirrel({
        cwd: generatePath(),
        mock: [foo],
        fetch: false,
        indexes: ['foo']
    });

    t.same(squirrel.getBy('foo', 'foo'), foo);
    t.same(squirrel.getBy('foo', 'baz'), null);
});

test('should index by deeper level field', function(t) {
    var squirrel = createSquirrel({
        cwd: generatePath(),
        mock: [foo],
        fetch: false,
        indexes: ['bar.baz']
    });

    t.same(squirrel.getBy('bar.baz', 'baz'), foo);
    t.same(squirrel.getBy('bar.baz', 'foo'), null);
});
