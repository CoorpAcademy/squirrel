'use strict';

var _ = require('lodash/fp');
var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
var createEtcdDriver = require('./etcd-driver');

function addNode(node, prevNode, store) {
    if (!_.startsWith(store.key, node.key)) return store;
    if (node.key === store.key) return node;

    var index = _.findIndex(function(child) {
        return _.startsWith(child.key, node.key);
    }, store.nodes);

    if (index > -1) {
        return _.set(
            'nodes',
            _.map(function(child) {
                return addNode(node, prevNode, child);
            }, store.nodes),
            store
        );
    }

    var storeKey = path.join(
        store.key,
        path.relative(store.key, node.key).split('/').shift()
    );

    return _.set(
        'nodes',
        _.concat(
            store.nodes,
            addNode(node, prevNode, {
                key: storeKey,
                dir: true
            })
        ),
        store
    );
}

function removeNode(node, prevNode, store) {
    if (node.key === store.key) return null;

    if (store.dir && _.startsWith(store.key, node.key))
        return _.set(
            'nodes',
            _.compact((store.nodes || []).map(function(child) {
                return removeNode(node, prevNode, child);
            })),
            store
        );

    return store;
}

function createSquirrel(options) {
    options = _.assign({
        mock: null,
        cwd: '/',
        indexes: ['name', 'host'],
        fallback: null,
        save: false,
        fetch: true
    }, options);

    function updateStore(store) {
        store = store || {};
        var indexes = updateIndexes(store);

        return Promise.fromCallback(function(cb) {
            if (options.fallback && options.save)
                return fs.writeFile(options.fallback, JSON.stringify(store, null, 4), cb);
            cb();
        }).return({
            store: store,
            indexes: indexes
        });
    }

    function updateIndexes(store) {
        return _.zipObject(options.indexes, _.map(function(index) {
            return buildIndex(index, store);
        }, options.indexes));
    }

    function buildIndex(index, node) {
        var value = _.get(index, node.value);

        return _.pipe(
            _.map(function(child) {
                return buildIndex(index, child);
            }),
            _.reduce(_.concat, []),
            _.reduce(_.assign, value ? _.zipObject([_.get(index, node.value)], [node]) : {})
        )(node.dir && node.nodes || []);
    }

    var state$ = Promise.resolve();

    var driver = createEtcdDriver(options);
    driver.watch({
        set: function(err, node, prevNode) {
            if (node.dir && prevNode) return;
            state$ = state$.then(_.get('store')).then(function(store) {
                return addNode(node, prevNode, store);
            }).then(updateStore).catch(_.constant(state$));
        },
        delete: function(err, node, prevNode) {
            state$ = state$.then(_.get('store')).then(function(store) {
                return removeNode(node, prevNode, store);
            }).then(updateStore).catch(_.constant(state$));
        }
    });


    if (options.fallback)
        state$ = state$.then(function() {
            return Promise.try(function() {
                return updateStore(require(options.fallback));
            });
        }).catch(_.constant(state$));
    if (options.fetch) {
        state$ = state$.then(function() {
            return driver.list();
        }).then(function(node) {
            return updateStore(node);
        }).catch(_.constant(state$));
    }

    function getBy(index, key) {
        return state$.then(_.get('indexes')).then(function(indexes) {
            return _.has(key, indexes[index]) ? _.get(key, indexes[index]).value : null;
        });
    }

    function getAll(index) {
        return state$.then(_.get('indexes')).then(function(indexes) {
            return _.keys(indexes && indexes[index]);
        });
    }

    function getStore() {
        return state$.then(_.get('store'));
    }

    function get(path) {
        return state$.then(_.get('store')).then(function(store) {
            return _get(path, store);
        });
    }

    function _get(_path, node) {
        if (!node) return null;
        if (path.relative(node.key, _path) === '') return node;

        return _get(_path, _.find(function(child) {
            return _.startsWith(child.key, _path);
        }, node.nodes));
    }

    return {
        getBy: getBy,
        getAll: getAll,
        getStore: getStore,
        get: get
    };
}

module.exports = createSquirrel;
