'use strict';

var _ = require('lodash/fp');
var createEtcdDriver = require('./etcd-driver');

function createSquirrel(options) {
    options = _.assign({
        mock: [],
        cwd: '/',
        indexes: ['name', 'host'],
        fetch: true
    }, options);

    var store = {};
    var indexes = updateIndexes(store);
    function addNode(node) {
        store = _.clone(store);
        store[node.key] = node.value;
        indexes = updateIndexes(store);
    }
    function removeNode(node) {
        store = _.omit([node.key], store);
        indexes = updateIndexes(store);
    }

    function updateIndexes(store) {
        return _.zipObject(options.indexes, _.map(function(index) {
            return buildIndex(index, store);
        }, options.indexes));
    }

    function buildIndex(index, store) {
        return _.mapKeys(function(key) {
            return _.get(index, store[key]);
        }, store);
    }


    var driver = createEtcdDriver(options);
    driver.watch({
        set: function(err, node) {
            addNode(node);
        },
        delete: function(err, node, prevNode) {
            removeNode(prevNode);
        }
    });

    options.mock.forEach(addNode);
    if (options.fetch)
        driver.list().then(function(node) {
            store = {};
            node.nodes.forEach(addNode);
        });

    function getBy(index, key) {
        return _.has(key, indexes[index]) ? _.get(key, indexes[index]) : null;
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
