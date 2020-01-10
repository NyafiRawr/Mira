import * as dotenv from 'dotenv';

// загружаем .env файл в переменные окружения
dotenv.config({ debug: Boolean(process.env.DEBUG) });

/**
 * Требует что бы обязательно была указана переменная окружения
 * @param {string} name название переменной
 */
const requireProcessEnv = (name: string) => {
  if (!process.env[name]) {
    throw new Error(`Необходимо указать ${name} переменную окружения`);
  }
  return process.env[name];
};

export default {
  logger: {
    name: 'Mira',
    level: process.env.LEVEL || 'info',
  },
  bot: {
    prefix: process.env.BOT_PREFIX || '!',
    token: requireProcessEnv('BOT_TOKEN'),
  },
  db: {
    // Параметры по умолчанию
    dialect: process.env.DB_DIALECT || 'mysql',
    storage: process.env.DB_STORAGE || 'database.sqlite',

    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PSW || 'toor',
    database: process.env.DB_DATABASE || 'mira',
  },
  osu_token: process.env.OSU_TOKEN || '',
};
