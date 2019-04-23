'use strict';

const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');
const debug = require('debug')('core:squirrel');
const createSquirrel = require('@coorpacademy/squirrel').default;
const {BrandNotFound} = require('../util/error');
const cluster = require('./cluster');
const local = require('./local');

function squirrelFactory(options = {}) {
  const hosts = _.get(options, 'etcd.hosts');
  if (hosts) {
    // allow clustered workers to have their own temp file
    return createSquirrel;
  }
  return local.createSquirrel;
}

function squirrelResolver(_options = {}, squirrel) {
  function matchHost(host) {
    debug('find by host', host);
    return squirrel.getBy('host', host).then(function(node) {
      debug('result by host', host, JSON.stringify(node, null, 4));
      if (!node) return Promise.reject(new BrandNotFound(`Not found : host => ${host}`, host));
      return node;
    });
  }

  function matchWS(ws) {
    debug('find by ws', ws);
    return squirrel.getBy('ws', ws).then(function(node) {
      debug('result by ws', ws, JSON.stringify(node, null, 4));
      if (!node) return Promise.reject(new BrandNotFound(`Not found : ws => ${ws}`, ws));
      return node;
    });
  }

  function matchAlias(alias) {
    debug('find by alias', alias);
    return squirrel.getBy('alias', alias).then(function(node) {
      debug('result by alias', alias, JSON.stringify(node, null, 4));
      if (!node) return Promise.reject(new BrandNotFound(`Not found : alias => ${alias}`, alias));
      return node;
    });
  }

  function matchName(name) {
    debug('find by name', name);
    return squirrel.getBy('payload.name', name).then(function(node) {
      debug('result by name', name, JSON.stringify(node, null, 4));
      if (!node)
        return Promise.reject(new BrandNotFound(`Not found : payload.name => ${name}`, name));
      return node;
    });
  }

  function matchDbName(dbName) {
    debug('find by dbname', dbName);
    return squirrel.getBy('payload.mongodb.dbName', dbName).then(function(node) {
      debug('result by dbName', dbName, JSON.stringify(node, null, 4));
      if (!node)
        return Promise.reject(
          new BrandNotFound(`Not found : payload.mongodb.dbName => ${dbName}`, dbName)
        );
      return node;
    });
  }

  const resolver = function(hostname = '') {
    // eslint-disable-next-line promise/valid-params
    return Promise.resolve(matchHost(hostname))
      .catch(BrandNotFound, function() {
        return matchWS(hostname);
      })
      .catch(BrandNotFound, function() {
        return matchAlias(
          hostname
            .split(':')
            .shift()
            .split('.')
            .shift()
        );
      })
      .catch(BrandNotFound, function() {
        return matchName(hostname);
      })
      .catch(BrandNotFound, function() {
        return matchDbName(hostname);
      })
      .catch(BrandNotFound, function() {
        throw new BrandNotFound('Brand not defined', hostname);
      })
      .then(function(node) {
        return node;
      });
  };

  resolver.getBrands = function() {
    return Promise.resolve(squirrel.getAll('payload.name'));
  };

  resolver.setBrand = function(hostname, value) {
    // eslint-disable-next-line promise/valid-params
    return resolver(hostname)
      .catch(BrandNotFound, err => null)
      .then(node => {
        const brand = _.get(node, 'payload.brand') || hostname;
        return squirrel.set(brand, value);
      });
  };

  resolver.patchBrand = function(hostname, patch) {
    return resolver(hostname).then(node => {
      const mergedValue = _.mergeWith({}, node, patch, (nodeValue, patchValue, key) => {
        if (_.isArray(patchValue) || key === 'dashboardSections') return patchValue;
      });
      return resolver.setBrand(hostname, mergedValue);
    });
  };

  resolver.delBrand = function(hostname) {
    // eslint-disable-next-line promise/valid-params
    return resolver(hostname)
      .catch(BrandNotFound, err => null)
      .then(node => {
        const brand = _.get(node, 'id') || hostname;
        return squirrel.del(brand);
      });
  };

  return resolver;
}

function createResolver(_options = {}) {
  const options = _.defaultsDeep({}, _options, {
    etcd: {
      indexes: ['host', 'ws', 'alias', 'payload.name', 'payload.mongodb.dbName']
    }
  });
  const squirrel = squirrelFactory(options)(options.etcd);
  return squirrelResolver(options, squirrel);
}

function getFallbackPath() {
  return path.join(`tmp/squirrel-${cluster.workerId()}.json`);
}

module.exports = createResolver;
module.exports.fallbackPath = getFallbackPath;
module.exports.createSquirrel = squirrelFactory;
module.exports.BrandNotFound = BrandNotFound;
