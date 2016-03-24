var path = require('path');
var Promise = require('bluebird');
var retry = require('bluebird-retry');

var retryOptions = {
    max_tries: -1,
    interval: 10,
    timeout: 2000
};

function _retry(squirrel, path, test) {
    return retry(function() {
        return squirrel.get(path).then(function(node) {
            if (test(node)) return Promise.resolve(node);
            return Promise.reject(new Error());
        });
    }, retryOptions);
}

function generatePath() {
    return path.join(
        '/test',
        Date.now().toString(),
        Math.random().toString().slice(2),
        'folder'
    );
}

module.exports = {
    retry: _retry,
    generatePath: generatePath
};
