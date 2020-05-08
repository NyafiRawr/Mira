import { Sequelize, Dialect } from 'sequelize';
import config from './config';

export const sequelize = (() => {
  if (config.db.dialect === 'sqlite') {
    return new Sequelize({
      dialect: config.db.dialect,
      storage: config.db.storage,
      define: {
        timestamps: false,
      },
      logging: false,
    });
  }
  return new Sequelize(config.db.database, config.db.user, config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect as Dialect,
    storage: config.db.storage,
    define: {
      timestamps: false,
    },
    logging: false,
  });
})();
