import Sequelize from 'sequelize';
import config from '../config';

// eslint-disable-next-line import/prefer-default-export
export const sequelize = (() => {
  if (config.db.dialect === 'sqlite') {
    return new Sequelize({
      dialect: config.db.dialect,
      storage: config.db.storage,
    });
  }
  return new Sequelize(config.db.database, config.db.user, config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect,
    define: {
      timestamps: false,
    },
    // logging: false,
    storage: config.db.storage,
  });
})();
