#! /usr/bin/env node
var path = require('path');
var minimist = require('minimist')
var _ = require('lodash/fp');
var createDriver = require('../src/etcd-driver');

var argz = minimist(process.argv.slice(2));

var driver = createDriver({
    hosts: argz.hosts ? argz.hosts.split(',') : undefined,
    cwd: argz.cwd
});

var files = require(path.join(process.cwd(), argz.file));

driver.list().then(function(node) {
    return _.pipe(
        _.map(function(node) {
            if (node.dir)
                return driver.rmdir(node.key);
            return driver.del(node.key);
        })
    )(node.nodes || []);
}).then(function() {
    return Promise.all(
        _.pipe(
            _.toPairs,
            _.map(_.spread(function(key, value) {
                return driver.set(key, value);
            }))
        )(files)
    );
}).then(function() {
    return driver.list()
}).then(function(node) {
    process.stdout.write(JSON.stringify(node, null, 4));
}, function(err) {
    process.stderr.write(err.stack);
});
