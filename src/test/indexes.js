'use strict';

var path = require('path');
var test = require('ava');
var createSquirrel = require('..');

function generatePath() {
    return path.join(
        '/test',
        Date.now().toString(),
        Math.random().toString().slice(2),
        'folder'
    );
}

function generateMock(cwd) {
    return {
        key: cwd,
        dir: true,
        nodes: [foo]
    };
}

var foo = {
    key: 'foo',
    value: {
        'foo': 'foo',
        'bar': {
            'baz': 'baz'
        }
    }
};

test('should index by first level field', function(t) {
    var cwd = generatePath();
    var mock = generateMock(cwd);
    var squirrel = createSquirrel({
        cwd: cwd,
        mock: mock,
        fetch: false,
        indexes: ['foo']
    });

    t.same(squirrel.getBy('foo', 'foo'), foo.value);
    t.same(squirrel.getBy('foo', 'baz'), null);
});

test('should index by deeper level field', function(t) {
    var cwd = generatePath();
    var mock = generateMock(cwd);
    var squirrel = createSquirrel({
        cwd: cwd,
        mock: mock,
        fetch: false,
        indexes: ['bar.baz']
    });

    t.same(squirrel.getBy('bar.baz', 'baz'), foo.value);
    t.same(squirrel.getBy('bar.baz', 'foo'), null);
});
