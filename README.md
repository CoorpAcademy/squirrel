# Squirrel

[![Build Status](https://travis-ci.org/CoorpAcademy/squirrel.svg?branch=master)](https://travis-ci.org/CoorpAcademy/squirrel)
[![codecov](https://codecov.io/gh/CoorpAcademy/squirrel/branch/master/graph/badge.svg)](https://codecov.io/gh/CoorpAcademy/squirrel)

Keep a replication of ETCD folder locally for low latency querying.
Provide an index system to access a file without scanning all nodes.

# Summary

- [Install](#install)
- [Usage](#usage)
  - [Node Interface](#node-interface)
    - [`get(path)`](#getpath)
    - [`getBy(index, key)`](#getbyindex-key)
    - [`getAll(index)`](#getallindex)
    - [`set(path, value)`](#setpath-value)
  - [Command Line Interface](#command-line-interface)
    - [`squirrel-sync`](#squirrel-sync)
    - [`squirrel-watch`](#squirrel-watch)
- [Index System](#index-system)
- [Fallback System](#fallback-system)
- [Test](#test)

# Install

```Shell
$ npm install --save @coorpacademy/squirrel
```

```JavaScript
import createSquirrel from '@coorpacademy/squirrel';
```

# Usage

## Node Interface

```JavaScript
const squirrel = createSquirrel({
    hosts: 'http://localhost:2379',
    auth: null,
    ca: null,
    key: null,
    cert: null,

    cwd: '/',
    fallback: '/tmp/squirrel.json',
    indexes: ['foo', 'bar.baz']
});
```

Options:
- `hosts`: ETCD hosts. [more](https://github.com/stianeikeland/node-etcd/#etcdhosts--1270012379-options)
- `auth`: A hash containing `{user: "username", pass: "password"}` for basic auth. [more](https://github.com/stianeikeland/node-etcd/#constructor-options)
- `ca`: Ca certificate. [more](https://github.com/stianeikeland/node-etcd/#constructor-options)
- `key`: Client key. [more](https://github.com/stianeikeland/node-etcd/#constructor-options)
- `cert`: Client certificate. [more](https://github.com/stianeikeland/node-etcd/#constructor-options)
- `cwd`: ETCD current working directory.
- `fallback`: Temporary file to save ETCD backup.
- `indexes`: Array of key to index.

### Methods

Consider the following folder:


```Shell
/
├── bar
│   └── baz   { "bar": { "baz": "qux" } }
└── foo       { "foo": "bar" }
```

#### `get(path)`

Get file by path. Returns `Promise`;

- `path` (String): the path of the file to get.

```JavaScript
const foo = await squirrel.get('/foo');
console.log(foo); // { "foo": "bar" }

const barBaz = await squirrel.get('/bar/baz');
console.log(barBaz); // { "bar": { "baz": "qux" } }
```

#### `getBy(index, key)`

Get by index value. Returns `Promise`;

- `index` (String): the path of the property to get. It needs to be declared in the [`indexes` option](#node-interface)
- `key` (String): the value to match

```JavaScript
const foo = await squirrel.getBy('foo', 'bar');
console.log(foo); // { "foo": "bar" }

const barBaz = await squirrel.getBy('bar.baz', 'qux');
console.log(barBaz); // { "bar": { "baz": "qux" } }
```

Fields can be nested, as described by [`_.get`](https://lodash.com/docs#get).

#### `getAll(index)`

Get index Map. Returns `Promise`;

- `index` (String): the path of the property to get. It needs to be declared in the [`indexes` option](#node-interface)

```JavaScript
const foo = await squirrel.getAll('foo');
console.log(foo); // { "bar": { "foo": "bar" } }

const barBaz = await squirrel.getAll('bar.baz');
console.log(barBaz); // { "qux": { "bar": { "baz": "qux" } } }
```

#### `set(path, value)`

Set file by path. Returns `Promise`;

- `path` (String): the path of the file to get.
- `value` (Object): An object to store in file. Will be serialized.

```JavaScript
const foo = await squirrel.set('/foo',  { "foo": "bar" });
console.log(foo); // { "foo": "bar" }

```


## Command Line Interface

### `squirrel-sync`

Synchronize FS folder with ETCD folder.

```Shell
$ squirrel-sync --hosts localhost:2379 ./fs-folder /etcd-folder
```

### `squirrel-watch`

Watch ETCD folder changes.

```Shell
$ squirrel-watch --hosts localhost:2379 /etcd-folder
```

### `squirrel-dump`

Write ETCD folder in `preloadedStore` format.

```Shell
$ squirrel-dump --hosts localhost:2379 /etcd-folder ./dump.json
```

### Arguments

- `--hosts="host1,host2"`: ETCD hosts. [more](https://github.com/stianeikeland/node-etcd/#etcdhosts--1270012379-options)
- `--ca=/file.ca`: Ca certificate. [more](https://github.com/stianeikeland/node-etcd/#constructor-options)
- `--key=/file.key`: Client key. [more](https://github.com/stianeikeland/node-etcd/#constructor-options)
- `--cert=/file.cert`: Client certificate. [more](https://github.com/stianeikeland/node-etcd/#constructor-options)

# Index System

Squirrel allows to put JSON in file. In this case, it could be indexes to access directly. Consider the following ETCD directory.

```Shell
/
├── file1 { "foo": "bar" }
├── file2 { "foo": "baz" }
└── file3 { "foo": "qux" }
```

First of all, we should indicate Squirrel which paths we want to index.

```JavaScript
const squirrel = createSquirrel({
  indexes: ['foo']
});
```

Now, we can get the contents of `file1` by searching for its `foo` value.

```JavaScript
const file1 = await squirrel.getBy('foo', 'bar');
console.log(file1); // { "foo": "bar" }
```

We can also get the value of the index as an object.

```JavaScript
const fooIndex = await squirrel.getAll('foo');
console.log(fooIndex);
/*
{
  "bar": { "foo": "bar" },
  "baz": { "foo": "baz" },
  "qux": { "foo": "qux" }
}
 */
```

If two files have the same index value, Squirrel keeps one of the two.

Squirrel scans all files, no matter how deep, that contain a JSON value.

Index could be a complex path, as long as it works with [`_.get`](https://lodash.com/docs#get).

# Fallback System

By declaring a `fallback` path, Squirrel is able :
- to save its state every time a change is made
- to restore the state to be faster on the next restart even if ETCD isn't available.

# Test

You may run tests with

```Shell
$ npm test
```

# [Marble](./MARBLE.md)

