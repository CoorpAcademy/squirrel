'use strict';

var Promise = require('bluebird');
var retry = require('bluebird-retry');

var retryOptions = {
    max_tries: -1,
    interval: 10,
    timeout: 2000
};

module.exports = function(squirrel, path, test) {
    return retry(function() {
        return squirrel.get(path).then(function(node) {
            if (test(node)) return Promise.resolve(node);
            return Promise.reject(new Error());
        });
    }, retryOptions);
};
