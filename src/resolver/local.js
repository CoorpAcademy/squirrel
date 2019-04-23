'use strict';

const _ = require('lodash');
const debug = require('debug')('core:squirrel:local');

let store = {};
const Promise = require('bluebird');

function resetStore() {
  store = {};
}

function setStore(_store) {
  store = _store;
}

function createBrand(name = 'digital', _options = {}) {
  const dbName = `coorpacademy-${name}${process.env.NODE_ENV === 'test' ? '-test' : ''}`;
  const skin = process.env.NODE_BRAND || process.env.NODE_BRAND_TEMPLATE || name;
  const PORT = _options.port || (process.env.NODE_ENV === 'test' ? 3001 : 3000);
  const PORT_WS = 3002;
  return {
    alias: name,
    id: name,
    host: `localhost:${PORT}`,
    ws: `localhost:${PORT_WS}`,
    payload: {
      name,
      skin,
      baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`,
      wsUrl: process.env.WS_URL || `http://localhost:${PORT_WS}`,
      mongodb: {
        uri: process.env.MONGODB_URI || `mongodb://localhost:27017/${dbName}`,
        dbName
      },
      elasticsearch: {
        uri:
          process.env.ELASTICSEARCH_URI ||
          process.env.FOUNDELASTICSEARCH_URL ||
          'http://localhost:9200/',
        apiVersion: '2.1'
      },
      aws: {
        secretAccessKey:
          process.env.AWS_SECRET_ACCESS_KEY || 'pLXvpGFQNovqCMRIB7W63sYex1GqV8YDYmY1+4Rn',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAIQAZ2FL5UNXOV3CA'
      },
      defaultDisciplines: 'bubbles',
      language: {
        default: 'en',
        supported: [
          'cs',
          'de',
          'en',
          'es',
          'fr',
          'it',
          'ja',
          'ko',
          'nl',
          'pl',
          'pt',
          'ru',
          'tr',
          'zh'
        ]
      },
      moocName: `Coorpacademy for ${name}`,
      teamName: name,
      contentCategoryName: 'custom',
      sector: 'none',
      useProgressions: true,
      subscriptionPlan: 'lite',
      slider: {
        start: {
          image: 'https://static.coorpacademy.com/content/digital/raw/hero-1489422528853.jpg',
          align: 'center',
          style: 'light'
        },
        resume: {
          image: 'https://static.coorpacademy.com/content/digital/raw/hero-1489422528853.jpg',
          align: 'center',
          style: 'light'
        },
        battle: {
          image: 'https://static.coorpacademy.com/content/digital/raw/battle-1489422528792.jpg',
          align: 'center',
          style: 'light'
        }
      },
      password: {
        enforcePasswordRenewal: false,
        validityInDays: 60
      },
      dashboardSections: {
        recommended: {
          order: 1,
          type: 'default',
          display: true
        },
        'most-popular': {
          order: 2,
          type: 'default',
          display: true
        },
        'most-recent': {
          order: 3,
          type: 'default',
          display: true
        },
        battle: {
          order: 4,
          type: 'default',
          display: true
        },
        news: {
          order: 5,
          type: 'default',
          display: true
        }
      },
      recommendations: {
        limit: 50,
        nbCustom: 3
      }
    }
  };
}

// init with default brand
function initStore(options = {}) {
  const name = options.name || process.env.NODE_BRAND || 'digital';
  if (store[name]) {
    return store[name];
  }
  store[name] = createBrand(name, options);
  debug('initStore', store);
  return store[name];
}

function matchHost(brands, host) {
  return Promise.resolve(_.find(brands, brand => _.get(brand, 'host') === host)).then(function(
    node
  ) {
    return node;
  });
}

function matchWS(brands, ws) {
  return Promise.resolve(_.find(brands, brand => _.get(brand, 'ws') === ws)).then(function(node) {
    return node;
  });
}

function matchAlias(brands, alias) {
  return Promise.resolve(_.find(brands, brand => _.get(brand, 'alias') === alias)).then(function(
    node
  ) {
    return node;
  });
}

function matchName(brands, name) {
  return Promise.resolve(_.find(brands, brand => _.get(brand, 'payload.name') === name)).then(
    function(node) {
      return node;
    }
  );
}

function matchDbName(brands, dbName) {
  return Promise.resolve(
    _.find(brands, brand => _.get(brand, 'payload.mongodb.dbName') === dbName)
  ).then(function(node) {
    return node;
  });
}

function getBy(type, value) {
  const storeArray = _.values(store);
  switch (type) {
    case 'host':
      return matchHost(storeArray, value);
    case 'ws':
      return matchWS(storeArray, value);
    case 'alias':
      return matchAlias(storeArray, value);
    case 'payload.name':
      return matchName(storeArray, value);
    case 'payload.mongodb.dbName':
      return matchDbName(storeArray, value);
    default:
      return Promise.reject(new Error('not yet implemented in mock'));
  }
}

function getAll() {
  const storeArray = _.values(store);
  return Promise.resolve(_.map(storeArray, brand => _.get(brand, 'payload.name')));
}

function set(brand, value) {
  store[brand] = value;
  return Promise.resolve(value);
}

function del(brand) {
  const hasBrand = _.has(store, brand);
  delete store[brand];
  return Promise.resolve(hasBrand);
}

function createSquirrel(options = {}) {
  initStore(options);
  return {
    getBy,
    getAll,
    set,
    del
  };
}

module.exports.createSquirrel = createSquirrel;
module.exports.resetStore = resetStore;
module.exports.setStore = setStore;
module.exports.getBy = getBy;
module.exports.createBrand = createBrand;
module.exports.delBrand = del;
