'use strict';

var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash/fp');
var Etcd = require('node-etcd');

var parse = function(node) {
    if(node.dir)
        return _.set('nodes', (node.nodes || []).map(parse), node);
    try{
        return _.set('value', JSON.parse(node.value), node);
    } catch(err) {
        return node;
    }
};

var stringify = JSON.stringify;

var getNode = _.get('node');

function createEtcdSync(options) {
    options = _.assign({
        cwd: '/',
        hosts: 'localhost:2379',
        auth: null,
        ca: null,
        key: null,
        cert: null
    }, options);

    var etcd = new Etcd(options.hosts, _.pick(['auth', 'ca', 'key', 'cert'], options));
    var nodes$ = Promise.resolve();

    function get(key, cb) {
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.get(
                    path.join(options.cwd, key),
                    cb
                );
            });
        }).then(getNode).then(parse).asCallback(cb);
    }

    function list(cb) {
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.get(
                    options.cwd,
                    { recursive: true },
                    cb
                );
            });
        }).then(getNode).then(parse).asCallback(cb);
    }

    function set(key, value, cb) {
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.set(
                    path.join(options.cwd, key),
                    stringify(value),
                    cb
                );
            });
        }).asCallback(cb);
    }

    function del(key, cb) {
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.del(
                    path.join(options.cwd, key),
                    cb
                );
            });
        }).asCallback(cb);
    }

    function rmdir(key, cb) {
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.rmdir(
                    key,
                    { recursive: true },
                    cb
                );
            });
        }).asCallback(cb);
    }

    function mkdir(key, cb) {
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.mkdir(
                    key,
                    { recursive: true, maxRetries: Infinity },
                    cb
                );
            });
        }).catch(function(err) {
            if (err.errorCode === 102)
                return [];
            if (err.errorCode === 107)
                return [];
            throw err;
        }).asCallback(cb);
    }

    function clean(cb) {
        return list().then(function(node) {
            return Promise.all(node.nodes.map(function(node) {
                var key = path.relative(options.cwd, node.key);
                return (node.dir ? rmdir : del)(key);
            }));
        }).then(function() {
            return true;
        }).asCallback(cb);
    }

    function wrapHook(hook) {
        return function(res) {
            if (res.node.dir) return;
            hook(
                null,
                parse(_.set('key', path.relative(options.cwd, res.node.key), res.node)),
                res.prevNode ? parse(_.set('key', path.relative(options.cwd, res.prevNode.key), res.prevNode)) : null
            );
        };
    }

    function watch(hooks) {
        var watcher = etcd.watcher(options.cwd, null, {recursive: true});

        _.forEach(function(hook, event) {
            watcher.on(event, wrapHook(hook));
        }, hooks);

        return watcher;
    }

    nodes$ = mkdir(options.cwd);

    return {
        get: get,
        set: set,
        del: del,
        list: list,
        clean: clean,
        watch: watch
    };
}

module.exports = createEtcdSync;
