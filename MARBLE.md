# Marble

## Fallback

On init, if a `fallback` file is specified, squirrel load content as first state. Allows restart without an available ETCD cluster.

- If `fallback` is specified

```
-A|
```

A is the content of fallback file wrapped in `GET` action.

```JSON
{
  "action": "GET",
  "node": {
    "key": "/",
    "dir": true,
    "nodes": []
  }
}
```

- If `fallback` isn't specified

```
|
```

- If `fallback` file doesn't exists

```
|
```

## Fetcher

On init, squirrel fetch ETCD until success.

```
-A|
```

A is the content of ETCD wrapped in `GET` action.

```JSON
{
  "action": "GET",
  "node": {
    "key": "/",
    "dir": true,
    "nodes": []
  }
}
```

On error, retry until is success.

## Watcher

Watch modification on ETCD cluster.

```
-A-B-C-
```

A B C are actions.

`SET` action:
```JSON
{
  "action": "set",
  "node": {
    "key": "/foo",
    "value": "foo",
    "modifiedIndex": 1438,
    "createdIndex": 1438
  },
  "prevNode": {
    "key": "/foo",
    "value": "bar",
    "modifiedIndex": 1437,
    "createdIndex": 1437
  }
}
```

`DELETE` action:
```JSON
{
  "action": "delete",
  "node": {
    "key": "/foo",
    "modifiedIndex": 1435,
    "createdIndex": 1434
  },
  "prevNode": {
    "key": "/foo",
    "value": "bar",
    "modifiedIndex": 1434,
    "createdIndex": 1434
  }
}
```

`RESYNC` action (server cleared and outdated the index)
```JSON
{
  "action": "resync"
}
```

## ETCD

Combine `fallback`, `fetcher` and `watcher` observable.

```
-A|       // fallback
-B|       // fetcher
--C-D-E-  // watcher

-ABC-D-E-
```

## Combiner

Aggregate ETCD's events to rebuild representation of ETCD content.

```
-a-b-c- // ETCD's events

------
 \ \ \
  A \ C
     B

-A---BC // ConcatAll
```

A & C are `SET` or `GET` events.
B is a `RESYNC` event which is tranform to `fetch` observable.