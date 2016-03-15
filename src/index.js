'use strict';

var _ = require('lodash/fp');
var path = require('path');
var createEtcdDriver = require('./etcd-driver');


function addNode(node, prevNode, store) {
    if (node.key === store.key) return node;

    if (node.dir && _.startsWith(store.key, node.key))
        return _.set(
            'nodes', (store.nodes || []).map(function(child) {
                return addNode(node, prevNode, child);
            }),
            store
        );

    if (!prevNode) {
        var fragments = path.relative(store.key, node.key).split('/');
        var fragment = fragments.shift();
        return _.set(
            'nodes',
            _.concat(node.nodes, [addNode(
                node,
                prevNode,
                fragment ? {
                    key: path.join(store.key, fragment),
                    dir: true
                } : node
            )]),
            store
        );
    }

    return store;
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
        fetch: true
    }, options);

    var store;
    var indexes;
    updateStore(options.mock || {});
    function updateStore(_store) {
        store = _store || {};
        indexes = updateIndexes(store);
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


    var driver = createEtcdDriver(options);
    driver.watch({
        set: function(err, node, prevNode) {
            updateStore(addNode(node, prevNode, store));
        },
        delete: function(err, node, prevNode) {
            updateStore(removeNode(node, prevNode, store));
        }
    });

    if (options.fetch)
        driver.list().then(function(node) {
            updateStore(node);
        });

    function getBy(index, key) {
        return _.has(key, indexes[index]) ? _.get(key, indexes[index]).value : null;
    }

    function getAll(index) {
        return _.keys(indexes[index]);
    }

    function getStore() {
        return store;
    }

    return {
        getBy: getBy,
        getAll: getAll,
        getStore: getStore
    };
}

module.exports = createSquirrel;
