import test from 'ava';
import {parseAction, parseNode} from '../parse';

test('should parseNode', t => {
  const tests = [{
    input: {
      dir: true
    },
    output: {
      key: '/',
      dir: true,
      nodes: []
    }
  }, {
    input: {
      key: '/foo',
      value: 'foo'
    },
    output: {
      key: '/foo',
      value: 'foo'
    }
  }, {
    input: {
      key: '/foo',
      value: JSON.stringify({
        foo: 'foo'
      })
    },
    output: {
      key: '/foo',
      value: {
        foo: 'foo'
      }
    }
  }, {
    input: {
      key: '/foo',
      dir: true,
      nodes: [{
        key: '/foo/bar',
        value: JSON.stringify({
          foo: 'foo'
        })
      }]
    },
    output: {
      key: '/foo',
      dir: true,
      nodes: [{
        key: '/foo/bar',
        value: {
          foo: 'foo'
        }
      }]
    }
  }];

  tests.forEach(({input, output}) =>
    t.deepEqual(parseNode(input), output)
  );
});

test('should parseAction', t => {
  const tests = [{
    input: {
      action: 'get'
    },
    output: {
      action: 'get'
    }
  }, {
    input: {
      action: 'foo'
    },
    output: {
      action: 'foo'
    }
  }, {
    input: {
      action: 'foo',
      node: {
        key: '/foo',
        value: JSON.stringify({
          foo: 'foo'
        })
      }
    },
    output: {
      action: 'foo',
      node: {
        key: '/foo',
        value: {
          foo: 'foo'
        }
      }
    }
  }, {
    input: {
      action: 'foo',
      prevNode: {
        key: '/foo',
        value: JSON.stringify({
          foo: 'foo'
        })
      }
    },
    output: {
      action: 'foo',
      prevNode: {
        key: '/foo',
        value: {
          foo: 'foo'
        }
      }
    }
  }];

  tests.forEach(({input, output}) =>
    t.deepEqual(parseAction(input), output)
  );
});

