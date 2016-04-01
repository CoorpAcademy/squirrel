#! /usr/bin/env node
var path = require('path');
var minimist = require('minimist');
var fs = require('fs');
var _ = require('lodash/fp');
var Promise = require('bluebird');
var createDriver = require('../etcd-driver');

function sync(source, cwd, driver) {
    return Promise.all([
        Promise.fromCallback(function(cb) {
            fs.stat(path.join(source, cwd), cb);
        }),
        driver.get(cwd).catch(function() {
            return Promise.resolve(null);
        })
    ]).then(function(results) {
        var stat = results[0];
        var node = results[1];

        if (stat.isDirectory()) {
            return (function() {
                if (!node) return driver.mkdir(cwd);
                if (node.dir) return Promise.resolve();
                return driver.del(cwd).then(function() {
                    return driver.mkdir(cwd);
                });
            })().then(function() {
                return Promise.all([
                    Promise.fromCallback(function(cb) {
                        fs.readdir(path.join(source, cwd), cb);
                    }),
                    driver.get(cwd)
                ]);
            }).then(function(results) {
                var files = results[0];
                var node = results[1];

                return Promise.all([].concat(
                    files.map(function(file) {
                        return sync(source, path.join(cwd, file), driver);
                    }),
                    node.nodes.filter(function(node) {
                        return !~files.indexOf(node.key);
                    }).map(function(node) {
                        if (node.dir)
                            return driver.rmdir(path.join(cwd, node.key));
                        return driver.del(path.join(cwd, node.key));
                    })
                ));
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

function syncFolder(source, destination, options) {
    options = _.assign(options, {
        cwd: destination
    });

    var driver = createDriver(options);
    return sync(source, '', driver);
}

module.exports = syncFolder;

if (!module.parent) {
    var argz = minimist(process.argv.slice(2));

    var source = path.join(process.cwd(), argz._[0]);
    var destination = path.join('/', argz._[1]);

    var options = {};
    if (argz.hosts) options = _.set('hosts', argz.hosts.split(','), options);
    if (argz.ca) options = _.set('ca', fs.readFileSync(path.join(process.cwd(), argz.ca)), options);

    process.stdout.write('Copy ' + source + ' local directory to ' + destination + ' etcd directory \n');
    syncFolder(source, destination, options).then(function() {
        process.stdout.write('Sync\n');
    }, function(err) {
        process.stdout.write('Sync\n');
    });
}
