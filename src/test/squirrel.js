import test from 'ava';
import {createSquirrel} from '../index';

test('should create Squirrel', t => {
  createSquirrel();
});

test('should close etcd watcher', t => {
  createSquirrel().close();
});
