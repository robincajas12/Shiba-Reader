import { open } from '@op-engineering/op-sqlite';

const db = open({
  name: 'ippodake.ringo.database.db',
});

export default db;
