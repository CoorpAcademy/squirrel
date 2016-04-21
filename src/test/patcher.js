import test from 'ava';
import {get, set, del} from '../patcher';

test('should get node', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      value: 'foo'
    }]
  };

  const action = {
    action: 'get',
    node: {
      key: '/foo'
    }
  };

  const output = {
    key: '/foo',
    value: 'foo'
  };
  t.deepEqual(get(input, action), output);
});

test('shouldn\'t found node', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: []
  };

  const action = {
    action: 'get',
    node: {
      key: '/foo',
      value: '{"foo": "foo"}'
    }
  };

  const output = null;

  t.deepEqual(get(input, action), output);
});

test('should get deep node', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      dir: true,
      nodes: [{
        key: '/foo/foo',
        value: 'foo'
      }, {
        key: '/foo/bar',
        value: 'bar'
      }]
    }]
  };

  const action = {
    action: 'get',
    node: {
      key: '/foo/bar'
    }
  };

  const output = {
    key: '/foo/bar',
    value: 'bar'
  };

  t.deepEqual(get(input, action), output);
});
test('should set node', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      value: 'foo'
    }]
  };

  const action = {
    action: 'set',
    node: {
      key: '/foo',
      value: '{"foo": "foo"}'
    },
    prevNode: {
      key: '/foo',
      value: 'foo'
    }
  };

  const output = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      value: '{"foo": "foo"}'
    }]
  };
  t.deepEqual(set(input, action), output);
});

test('should create node', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: []
  };

  const action = {
    action: 'set',
    node: {
      key: '/foo',
      value: '{"foo": "foo"}'
    }
  };

  const output = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      value: '{"foo": "foo"}'
    }]
  };

  t.deepEqual(set(input, action), output);
});

test('should create deep node', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: []
  };

  const action = {
    action: 'set',
    node: {
      key: '/foo/bar',
      value: '{"bar": "bar"}'
    }
  };

  const output = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      dir: true,
      nodes: [{
        key: '/foo/bar',
        value: '{"bar": "bar"}'
      }]
    }]
  };

  t.deepEqual(set(input, action), output);
});

test('should remove unknown node', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: []
  };

  const action = {
    action: 'delete',
    node: {
      key: '/foo/bar'
    },
    prevNode: {
      key: '/foo/bar',
      value: 'bar'
    }
  };

  const output = {
    key: '/',
    dir: true,
    nodes: []
  };

  t.deepEqual(del(input, action), output);
});

test('should remove folder', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      dir: true,
      nodes: [{
        key: '/foo/foo',
        dir: true,
        nodes: [{
          key: '/foo/foo/foo',
          value: 'foo'
        }, {
          key: '/foo/foo/bar',
          value: 'bar'
        }]
      }]
    }]
  };

  const action = {
    action: 'delete',
    node: {
      key: '/foo/foo'
    },
    prevNode: {
        key: '/foo/foo',
        dir: true,
        nodes: [{
          key: '/foo/foo/foo',
          value: 'foo'
        }, {
          key: '/foo/foo/bar',
          value: 'bar'
        }]
      }
  };

  const output = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      dir: true,
      nodes: []
    }]
  };

  t.deepEqual(del(input, action), output);
});

test('should remove file', t => {
  const input = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      dir: true,
      nodes: [{
        key: '/foo/foo',
        value: 'foo'
      }, {
        key: '/foo/bar',
        value: 'bar'
      }]
    }]
  };

  const action = {
    action: 'delete',
    node: {
      key: '/foo/foo'
    },
    prevNode: {
      key: '/foo/foo',
      value: 'foo'
    }
  };

  const output = {
    key: '/',
    dir: true,
    nodes: [{
      key: '/foo',
      dir: true,
      nodes: [{
        key: '/foo/bar',
        value: 'bar'
      }]
    }]
  };

  t.deepEqual(del(input, action), output);
});
