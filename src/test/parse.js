import test from 'ava';
import {stringify, parseValue, parseAction, parseNode} from '../parse';

test('should parse value as JSON', t => {
  const expected = {
    foo: 'foo'
  };
  t.deepEqual(parseValue(stringify(expected)), expected);
});

test("shouldn't parse value if ", t => {
  const expected = 'foo';
  t.deepEqual(parseValue(expected), expected);
});

test('should parseNode', t => {
  const tests = [
    {
      input: {
        dir: true
      },
      output: {
        key: '/',
        dir: true,
        nodes: []
      }
    },
    {
      input: {
        key: '/foo',
        value: 'foo'
      },
      output: {
        key: '/foo',
        value: 'foo'
      }
    },
    {
      input: {
        key: '/foo',
        value: stringify({
          foo: 'foo'
        })
      },
      output: {
        key: '/foo',
        value: {
          foo: 'foo'
        }
      }
    },
    {
      input: {
        key: '/foo',
        dir: true,
        nodes: [
          {
            key: '/foo/bar',
            value: stringify({
              foo: 'foo'
            })
          }
        ]
      },
      output: {
        key: '/foo',
        dir: true,
        nodes: [
          {
            key: '/foo/bar',
            value: {
              foo: 'foo'
            }
          }
        ]
      }
    }
  ];

  tests.forEach(({input, output}) => t.deepEqual(parseNode(input), output));
});

test('should parseAction', t => {
  const tests = [
    {
      input: {
        action: 'get'
      },
      output: {
        action: 'get'
      }
    },
    {
      input: {
        action: 'foo'
      },
      output: {
        action: 'foo'
      }
    },
    {
      input: {
        action: 'foo',
        node: {
          key: '/foo',
          value: stringify({
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
    },
    {
      input: {
        action: 'foo',
        prevNode: {
          key: '/foo',
          value: stringify({
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
    }
  ];

  tests.forEach(({input, output}) => t.deepEqual(parseAction(input), output));
});
