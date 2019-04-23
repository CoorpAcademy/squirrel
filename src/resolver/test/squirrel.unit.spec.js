'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const CoorpacademySquirrel = require('@coorpacademy/squirrel').default;
const squirrel = require('../../lib/squirrel');
const localSquirrel = require('../../lib/squirrel/local');

const setupSquirrelMock = (store, _squirrelOptions) => {
  localSquirrel.setStore(store);
  return squirrel(_.defaultsDeep({}, _squirrelOptions, {}));
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

describe('squirrel', function() {
  beforeEach(function() {
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
  });

  it('fallbackPath should be 0 on master', function() {
    const fallbackPath = squirrel.fallbackPath();
    expect(fallbackPath).to.equal('tmp/squirrel-0.json');
  });

  it('createResolver should fallback to legacy', function() {
    const resolver = squirrel();
    return resolver.getBrands().then(brands => {
      expect(brands).to.be.an.instanceof(Array);
      expect(brands).to.deep.equal(['digital']);
    });
  });

  describe('createSquirrel', function() {
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

    beforeEach(function() {
      resolver = setupSquirrelMock(_.cloneDeep(store));
    });

    afterEach(localSquirrel.resetStore.bind(localSquirrel));

    it('should find brand by host', function() {
      return resolver('chanel.coorpacademy.com').then(brand => {
        expect(brand).to.deep.equal(store.chanel);
      });
    });

    it('should find brand by ws', function() {
      return resolver('chanel-staging.coorpacademy.com').then(brand => {
        expect(brand).to.deep.equal(store.chanel);
      });
    });

    it('should find brand by alias', function() {
      return resolver('chanel-alias').then(brand => {
        expect(brand).to.deep.equal(store.chanel);
      });
    });

    it('should find brand by name', function() {
      return resolver('chanel-name').then(brand => {
        expect(brand).to.deep.equal(store.chanel);
      });
    });

    it('should find brand by dbname', function() {
      return resolver('specific-coorp-dbname').then(brand => {
        expect(brand).to.deep.equal(store.chanel);
      });
    });

    it('should set brand by name', function() {
      return resolver.setBrand('chanel3', {a: 'chanel3', payload: payloadFixture}).then(brand => {
        expect(brand).to.deep.equal({
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

    it('should set brand by name in staging', function() {
      const resolverMock = setupSquirrelMock(store, {env: 'staging'});
      return resolverMock
        .setBrand('chanel3', {a: 'chanel3', payload: payloadFixture})
        .then(brand => {
          expect(brand).to.deep.equal({
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

    it('should set and replace brand by name', function() {
      return resolver.setBrand('chanel', {a: 'chanel3', payload: payloadFixture}).then(brand => {
        expect(brand).to.deep.equal({
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

    it('should patch brand by name', function() {
      return resolver
        .patchBrand('chanel-name', {a: 'chanel3', payload: payloadFixture})
        .then(brand => {
          expect(brand).to.deep.equal({
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

    it('should replace and not merge dashboardSections when patching brand', function() {
      const dashboardSections = _.omit(payloadFixture.dashboardSections, 'them_123');
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
          expect(res.payload.dashboardSections).to.deep.equal(payloadFixture.dashboardSections);
          const payload2 = _.assign({}, payload, {dashboardSections});
          return resolver.patchBrand('chanel-name', {a: 'chanel3', payload: payload2});
        })
        .then(res => {
          expect(res.payload.dashboardSections).to.deep.equal(dashboardSections);
        });
    });

    it('should delete brand by name', function() {
      return resolver.delBrand('chanel-name').then(ret => {
        expect(ret).to.equal(true);
      });
    });

    it('should failed delete brand if it not exists', function() {
      return resolver.delBrand('unknown').then(ret => {
        expect(ret).to.equal(false);
      });
    });

    it('should failed find brand by host', function() {
      return resolver('chanel2.coorpacademy.com').then(
        brand => {
          throw new Error('should not occur');
        },
        err => {
          expect(err).to.be.an.instanceof(squirrel.BrandNotFound);
          expect(err.message).to.equal('Brand not defined');
        }
      );
    });

    it('should return @coorpacademy/squirrel instance if hosts in options', function() {
      const s = squirrel.createSquirrel({etcd: {hosts: []}});
      expect(s).to.equal(CoorpacademySquirrel);
    });
  });
});
