#! /usr/bin/env node
var path = require('path');
var minimist = require('minimist');
var fs = require('fs');
var Promise = require('bluebird');
var createDriver = require('../src/etcd-driver');

var argz = minimist(process.argv.slice(2));

var source = path.join(process.cwd(), argz._[0]);
var destination = path.join('/', argz._[1]);

var driver = createDriver({
    hosts: argz.hosts ? argz.hosts.split(',') : undefined,
    cwd: destination
});

function syncEntry(cwd) {
    return Promise.all([
        Promise.fromCallback(function(cb) {
            fs.stat(path.join(source, cwd), cb);
        }),
        driver.get(cwd).catch(function(err) {
            return Promise.resolve(null);
        })
    ]).then(function(results) {
        var stat = results[0];
        var node = results[1];

        if (stat.isDirectory()) {
            (function() {
                if (!node) return driver.mkdir(cwd);
                if (node.dir) return Promise.resolve();
                return driver.del(cwd).then(function() {
                    return driver.mkdir(cwd);
                });
            })().then(function() {
                return Promise.fromCallback(function(cb) {
                    fs.readdir(path.join(source, cwd), cb);
                });
            }).then(function(files) {
                return Promise.all(files.map(function(file) {
                    syncEntry(path.join(cwd, file));
                }));
            });
        }
        else {
            return (node && node.dir ? driver.rmdir(cwd) : Promise.resolve()).then(function() {
                return Promise.fromCallback(function(cb) {
                    return fs.readFile(path.join(source, cwd), cb);
                });
            }).then(function(data) {
                try {
                    return JSON.parse(data);
                } catch (err) {
                    return data;
                }
            }).then(function(data) {
                return driver.set(cwd, data);
            });
        }
    });
}

console.log('Copy ' + source + ' local directory to ' + destination + ' etcd directory');

syncEntry('').then(function() {
    console.log('Sync');
}, function(err) {
    console.error('Error:', err.stack);
});
