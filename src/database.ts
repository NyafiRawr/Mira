import { Sequelize, Dialect } from 'sequelize';
import config from './config';

const generalSettings = {
  dialect: config.db.dialect as Dialect,
  define: {
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  logging: console.log, // Или logging: function (str) {}
  sync: {
    force: false,
  },
};

export const sequelize = (() => {
  if (config.db.dialect === 'sqlite') {
    return new Sequelize({
      storage: config.db.storage,
      ...generalSettings,
    });
  }
  return new Sequelize(config.db.database, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    ssl: true,
    pool: {
      max: 10,
      min: 0,
      // The maximum time, in milliseconds, that a connection can be idle before being released.
      idle: 10000,
      // The maximum time, in milliseconds, that pool will try to get connection before throwing error
      acquire: 60000,
      // The time interval, in milliseconds, after which sequelize-pool will remove idle connections.
      evict: 1000,
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
      max: 5,
    },
    ...generalSettings,
  });
})();
