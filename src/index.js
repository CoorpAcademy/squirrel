'use strict';

var _ = require('lodash');
var createEtcdDriver = require('./etcd-driver');

function createSquirrel(options) {
    options = _.assign({
        mock: [],
        cwd: '/',
        indexes: ['name', 'host'],
        fetch: true
    }, options);

    var store = [];
    var indexes = updateIndexes(store);
    function addNode(node) {
        store = store.concat([node]);
        indexes = updateIndexes(store);
    }
    function removeNode(node) {
        store = _.without(store, _.find(store, node));
        indexes = updateIndexes(store);
    }

    function updateIndexes(store) {
        return _.chain(options.indexes).mapKeys(function(indexName) {
            return indexName;
        }).mapValues(function(indexName) {
            return _.mapKeys(store, function(node) {
                return _.get(node, indexName);
            });
        }).value();
    }


    var syncer = createEtcdDriver(options);
    syncer.watch({
        set: function(err, node) {
            addNode(node.value);
        },
        delete: function(err, node, prevNode) {
            removeNode(prevNode.value);
        }
    });

    options.mock.forEach(addNode);
    if (options.fetch)
        syncer.list().then(function(node) {
            store = [];
            node.nodes.forEach(addNode);
        });

    function getBy(index, key) {
        return _.get(indexes[index], key, null);
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
