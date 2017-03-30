import test from 'ava';
import {Observable} from 'rxjs';
import createCombiner$ from '../combine';
import emptyRoot from './fixtures/empty-root';
import setEvent from './fixtures/set-event';

test('should fetch nodes', async t => {
  const events$ = Observable.of(emptyRoot, setEvent, {
    action: 'set',
    node: {
      key: '/bar/bar',
      value: 'bar'
    }
  });
  const combiner$ = createCombiner$(events$);

  const expected = [
    emptyRoot.node,
    {
      ...emptyRoot.node,
      nodes: [setEvent.node]
    },
    {
      ...emptyRoot.node,
      nodes: [
        setEvent.node,
        {
          key: '/bar',
          dir: true,
          nodes: [
            {
              key: '/bar/bar',
              value: 'bar'
            }
          ]
        }
      ]
    }
  ];

  const events = await combiner$.toArray().toPromise();
  t.deepEqual(events, expected);
});

test('should remove node', async t => {
  const events$ = Observable.of(
    {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [
          {
            key: '/foo',
            value: 'foo'
          }
        ]
      }
    },
    {
      action: 'delete',
      node: {
        key: '/foo'
      }
    }
  );
  const combiner$ = createCombiner$(events$);

  const expected = [
    {
      key: '/',
      dir: true,
      nodes: [
        {
          key: '/foo',
          value: 'foo'
        }
      ]
    },
    {
      key: '/',
      dir: true,
      nodes: []
    }
  ];

  const events = await combiner$.toArray().toPromise();
  t.deepEqual(events, expected);
});

test('should prevent malformed actions', async t => {
  const events$ = Observable.of(
    {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [
          {
            key: '/foo',
            value: 'foo'
          }
        ]
      }
    },
    {},
    null,
    undefined,
    {
      foo: 'foo'
    },
    [],
    {
      action: 'foo'
    }
  );
  const combiner$ = createCombiner$(events$);

  const expected = {
    key: '/',
    dir: true,
    nodes: [
      {
        key: '/foo',
        value: 'foo'
      }
    ]
  };

  const events = await combiner$.toArray().toPromise();
  events.forEach(event => t.deepEqual(event, expected));
});
