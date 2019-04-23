/* eslint-disable ava/prefer-async-await */
import test from 'ava';
import * as _ from 'lodash/fp';
import CoorpacademySquirrel from '../..';
import squirrel, {createSquirrel, BrandNotFound} from '..';
import * as localSquirrel from '../local';

const setupSquirrelMock = (_store, _squirrelOptions) => {
  localSquirrel.setStore(_store);
  return squirrel(_.cloneDeep(_squirrelOptions));
};

const defaultLanguage = {
  default: 'en',
  supported: ['en']
};

const payloadFixture = {
  language: defaultLanguage,
  subscriptionPlan: 'lite',
  moocName: 'Coorpacademy for chanel3',
  teamName: 'chanel3',
  contentCategoryName: 'custom',
  useProgressions: true,
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
    enforcePasswordRenewal: true,
    validityInDays: 30
  },
  recommendations: {limit: 50, nbCustom: 3},
  dashboardSections: {
    recommended: {order: 1, type: 'default', display: true},
    'most-popular': {order: 2, type: 'default', display: true},
    'most-recent': {order: 3, type: 'default', display: true},
    battle: {order: 4, type: 'default', display: false},
    news: {order: 5, type: 'default', display: true},
    them_123: {order: 6, type: 'theme', display: true},
    them_456: {order: 7, type: 'theme', display: false}
  }
};
let resolver;
const store = {
  chanel: {
    id: 'chanel',
    ws: 'chanel-staging.coorpacademy.com',
    alias: 'chanel-alias',
    host: 'chanel.coorpacademy.com',
    payload: {
      name: 'chanel-name',
      mongodb: {
        dbName: 'specific-coorp-dbname'
      },
      language: defaultLanguage
    }
  }
};

test.beforeEach(function() {
  resolver = setupSquirrelMock(_.cloneDeep(store));
});

test.afterEach(localSquirrel.resetStore.bind(localSquirrel));

test.serial('should find brand by host', t => {
  return resolver('chanel.coorpacademy.com').then(brand => {
    return t.deepEqual(brand, store.chanel);
  });
});

test.serial('should find brand by ws', t => {
  return resolver('chanel-staging.coorpacademy.com').then(brand => {
    return t.deepEqual(brand, store.chanel);
  });
});

test.serial('should find brand by alias', t => {
  return resolver('chanel-alias').then(brand => {
    return t.deepEqual(brand, store.chanel);
  });
});

test.serial('should find brand by name', t => {
  return resolver('chanel-name').then(brand => {
    return t.deepEqual(brand, store.chanel);
  });
});

test.serial('should find brand by dbname', t => {
  return resolver('specific-coorp-dbname').then(brand => {
    return t.deepEqual(brand, store.chanel);
  });
});

test.serial('should set brand by name', t => {
  return resolver.setBrand('chanel3', {a: 'chanel3', payload: payloadFixture}).then(brand => {
    return t.deepEqual(brand, {
      a: 'chanel3',
      payload: {
        language: defaultLanguage,
        subscriptionPlan: 'lite',
        moocName: 'Coorpacademy for chanel3',
        teamName: 'chanel3',
        contentCategoryName: 'custom',
        useProgressions: true,
        password: {
          enforcePasswordRenewal: true,
          validityInDays: 30
        },
        dashboardSections: payloadFixture.dashboardSections,
        slider: payloadFixture.slider,
        recommendations: payloadFixture.recommendations
      }
    });
  });
});

test.serial('should set brand by name in staging', t => {
  const resolverMock = setupSquirrelMock(store, {env: 'staging'});
  return resolverMock.setBrand('chanel3', {a: 'chanel3', payload: payloadFixture}).then(brand => {
    return t.deepEqual(brand, {
      a: 'chanel3',
      payload: {
        language: defaultLanguage,
        subscriptionPlan: 'lite',
        moocName: 'Coorpacademy for chanel3',
        teamName: 'chanel3',
        contentCategoryName: 'custom',
        useProgressions: true,
        password: {
          enforcePasswordRenewal: true,
          validityInDays: 30
        },
        dashboardSections: payloadFixture.dashboardSections,
        slider: payloadFixture.slider,
        recommendations: payloadFixture.recommendations
      }
    });
  });
});

test.serial('should set and replace brand by name', t => {
  return resolver.setBrand('chanel', {a: 'chanel3', payload: payloadFixture}).then(brand => {
    return t.deepEqual(brand, {
      a: 'chanel3',
      payload: {
        language: defaultLanguage,
        subscriptionPlan: 'lite',
        moocName: 'Coorpacademy for chanel3',
        teamName: 'chanel3',
        contentCategoryName: 'custom',
        useProgressions: true,
        password: {
          enforcePasswordRenewal: true,
          validityInDays: 30
        },
        dashboardSections: payloadFixture.dashboardSections,
        slider: payloadFixture.slider,
        recommendations: payloadFixture.recommendations
      }
    });
  });
});

test.serial('should patch brand by name', t => {
  return resolver.patchBrand('chanel-name', {a: 'chanel3', payload: payloadFixture}).then(brand => {
    return t.deepEqual(brand, {
      a: 'chanel3',
      id: 'chanel',
      alias: 'chanel-alias',
      ws: 'chanel-staging.coorpacademy.com',
      host: 'chanel.coorpacademy.com',
      payload: {
        name: 'chanel-name',
        mongodb: {
          dbName: 'specific-coorp-dbname'
        },
        language: defaultLanguage,
        subscriptionPlan: 'lite',
        moocName: 'Coorpacademy for chanel3',
        teamName: 'chanel3',
        contentCategoryName: 'custom',
        useProgressions: true,
        password: {
          enforcePasswordRenewal: true,
          validityInDays: 30
        },
        dashboardSections: payloadFixture.dashboardSections,
        slider: payloadFixture.slider,
        recommendations: payloadFixture.recommendations
      }
    });
  });
});

test.serial('should replace and not merge dashboardSections when patching brand', t => {
  const dashboardSections = _.omit(['them_123'], payloadFixture.dashboardSections);
  const payload = {
    language: defaultLanguage,
    subscriptionPlan: 'lite',
    moocName: 'Coorpacademy for chanel3',
    teamName: 'chanel3',
    useProgressions: true,
    dashboardSections: payloadFixture.dashboardSections,
    slider: payloadFixture.slider,
    password: {
      enforcePasswordRenewal: false,
      validityInDays: 30
    },
    recommendations: payloadFixture.recommendations
  };

  return resolver
    .patchBrand('chanel-name', {a: 'chanel3', payload})
    .then(res => {
      t.deepEqual(res.payload.dashboardSections, payloadFixture.dashboardSections);
      const payload2 = _.assign(payload, {dashboardSections});
      return resolver.patchBrand('chanel-name', {a: 'chanel3', payload: payload2});
    })
    .then(res => {
      return t.deepEqual(res.payload.dashboardSections, dashboardSections);
    });
});

test.serial('should delete brand by name', t => {
  return resolver.delBrand('chanel-name').then(ret => {
    return t.true(ret);
  });
});

test.serial('should failed delete brand if it not exists', t => {
  return resolver.delBrand('unknown').then(ret => {
    return t.false(ret);
  });
});

test.serial('should failed find brand by host', t => {
  return resolver('chanel2.coorpacademy.com').then(
    brand => {
      throw new Error('should not occur');
    },
    err => {
      t.true(err instanceof BrandNotFound);
      t.is(err.message, 'Brand not defined');
    }
  );
});

test.serial('should return @coorpacademy/squirrel instance if hosts in options', t => {
  const s = createSquirrel({etcd: {hosts: []}});
  t.is(s, CoorpacademySquirrel);
});
