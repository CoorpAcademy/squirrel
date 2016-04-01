'use strict';

var path = require('path');
var execFile = require('child_process').execFile;
var test = require('ava');

var cli = require('../cli');

test('should sync cli', function(t) {
    return cli(path.join(__dirname, 'fixtures/1'), '/test/cli').then(function() {
        return new Promise(function(resolve, reject) {
            var child = execFile(path.join(__dirname, '../cli.js'), [
                path.join(__dirname, 'fixtures/2'),
                '/test/cli'
            ]);

            child.on('exit', function(code) {
                if (code !== 0) return reject(new Error('CLI : ' + code))
                resolve();
            });
        });
    });
});
