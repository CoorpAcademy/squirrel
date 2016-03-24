'use strict';

var path = require('path');
var debug = require('debug')('squirrel:etcd');
var Promise = require('bluebird');
var _ = require('lodash/fp');
var Etcd = require('node-etcd');

var parse = function(node) {
    if (node.dir)
        return _.set('nodes', (node.nodes || []).map(parse), node);
    try {
        return _.set('value', JSON.parse(node.value), node);
    } catch (err) {
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
    options.cwd = path.join('/', options.cwd);

    var etcd = new Etcd(options.hosts, _.pick(['auth', 'ca', 'key', 'cert'], options));
    var nodes$ = Promise.resolve();

    function get(key, cb) {
        debug('get', key);
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.get(
                    path.join(options.cwd, key),
                    cb
                );
            });
        }).then(getNode).then(parse).then(relative)
        .tap(debug.bind(null, 'get:cb', key)).asCallback(cb);
    }

    function list(cb) {
        debug('list');
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.get(
                    options.cwd,
                    { recursive: true },
                    cb
                );
            });
        }).then(getNode).then(parse).then(relative)
        .tap(debug.bind(null, 'list:cb')).asCallback(cb);
    }

    function set(key, value, cb) {
        debug('set', key, value);
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.set(
                    path.join(options.cwd, key),
                    stringify(value),
                    cb
                );
            });
        }).tap(debug.bind(null, 'set:cb', key, value)).asCallback(cb);
    }

    function del(key, cb) {
        debug('del', key);
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.del(
                    path.join(options.cwd, key),
                    cb
                );
            });
        }).tap(debug.bind(null, 'del:cb', key)).asCallback(cb);
    }

    function rmdir(key, cb) {
        debug('rmdir', key);
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.rmdir(
                    path.join(options.cwd, key),
                    { recursive: true },
                    cb
                );
            });
        }).tap(debug.bind(null, 'rmdir:cb', key)).asCallback(cb);
    }

    function mkdir(key, cb) {
        debug('mkdir', key);
        return nodes$.then(function() {
            return Promise.fromCallback(function(cb) {
                etcd.mkdir(
                    path.join(options.cwd, key),
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
        }).tap(debug.bind(null, 'mkdir:cb', key)).asCallback(cb);
    }

    function relative(node) {
        node = _.set(
            'key',
            path.join('/', path.relative(options.cwd, node.key || '')),
            node
        );

        if (node.dir && node.nodes)
            node = _.set(
                'nodes',
                _.map(relative, node.nodes),
                node
            );

        return node;
    }

    function watch(hooks) {
        debug('watch', _.keys(hooks));
        var watcher = etcd.watcher(options.cwd, null, {recursive: true});

        _.forEach(function(hook, event) {
            watcher.on(event, wrapHook(hook));
        }, hooks);

        return watcher;
    }

    function wrapHook(hook) {
        return function(res) {
            var node = res.node ? parse(relative(res.node)) : null;
            var prevNode = res.prevNode ? parse(relative(res.prevNode)) : null;
            debug('watch:' + res.action, node, prevNode);
            hook(
                null,
                node,
                prevNode
            );
        };
    }

    nodes$ = mkdir('/');

    return {
        get: get,
        set: set,
        del: del,
        list: list,
        mkdir: mkdir,
        rmdir: rmdir,
        watch: watch
    };
}

module.exports = createEtcdSync;
