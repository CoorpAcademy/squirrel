#! /usr/bin/env node
var path = require('path');
var minimist = require('minimist');
var fs = require('fs');
var Promise = require('bluebird');
var createDriver = require('../src/etcd-driver');

var argz = minimist(process.argv.slice(2));

var source = path.join(process.cwd(), argz._[0]);
var destination = path.join('/', argz._[1]);

var driverOptions = {
    cwd: destination
};
if (argz.hosts) driverOptions.hosts = argz.hosts.split(',');
if (argz.ca) driverOptions.ca = fs.readFileSync(path.join(process.cwd(), argz.ca));
var driver = createDriver(driverOptions);

function syncEntry(cwd) {
    return Promise.all([
        Promise.fromCallback(function(cb) {
            fs.stat(path.join(source, cwd), cb);
        }),
        driver.get(cwd).catch(function() {
            return Promise.resolve(null);
        })
    ]).then(function(results) {
        process.stdout.write('sync: /' + cwd + '\n');
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
                        return syncEntry(path.join(cwd, file));
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

process.stdout.write('Copy ' + source + ' local directory to ' + destination + ' etcd directory \n');

syncEntry('').then(function() {
    process.stdout.write('Sync\n');
}, function(err) {
    process.stderr.write('Error: \n' + err + '\n');
});
