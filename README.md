[![Build Status](https://travis-ci.org/CoorpAcademy/squirrel.svg?branch=master)](https://travis-ci.com/CoorpAcademy/squirrel)
[![Coverage Status](https://coveralls.io/repos/github/CoorpAcademy/squirrel/badge.svg?branch=master)](https://coveralls.io/github/CoorpAcademy/squirrel?branch=master)

# squirrel
Watch etcd folder and keep it synchronized.

## Install
```shell
$ npm install --save @coorpacademy/squirrel
```


## Usage
### Command Line Interface

```
squirrel-sync --hosts localhost:2379,localhost:2379 ./my-folder /etcd-folder
squirrel-watch --hosts localhost:2379,localhost:2379 /etcd-folder
```

### Retrieve a Client



## Test
You may run test with
```
$ npm test
```

Please note that test use an actual etcd service




## [Marble](./MARBLE.md)

