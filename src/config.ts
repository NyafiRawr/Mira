import * as dotenv from 'dotenv';
import * as packageJson from '../package.json';

// Загружаем файл .env в process.env
dotenv.config();

const requireProcessEnv = (name: string) => {
  if (process.env[name] == undefined) {
    throw new Error(`Необходимо указать ${name} переменную окружения`);
  }
  return process.env[name];
};

export default {
  discord: {
    prefix: requireProcessEnv('DISCORD_PREFIX') || '!',
    token: requireProcessEnv('DISCORD_TOKEN'),
    id: '394457633555349504', // Используется для приглашения
    permissions: '1043721425', // Используется для приглашения, требует 2FA владельца бота
  },
  db: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    // mysql
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'bot',
    // sqlite
    storage: process.env.DB_STORAGE || 'bot.sqlite',
  },
  defaultCooldown: {
    seconds: 1,
  },
  colors: {
    message: '#0099ff',
    alert: '#e84118',
    donate: '#4cd137',
    info: '#2CB0DE',
    invite: '#552F40',
    help: '#4b2c5e',
  },
  author: {
    discord: {
      nickname: packageJson.author,
      id: '197999736035344384', // Используется для доступа к команде `eval`
      tag: 'NyafiRawr#9896',
      invite: 'https://discord.gg/dYmrSZa',
    },
  },
  hosting: {
    name: 'FirstByte.ru',
    url: 'https://firstbyte.ru',
  },
  packageJson: packageJson,
  socialProfiles: {
    maxSizeBiography: 400,
    defaultPriceEditDesc: 1000,
    defaultPriceEditImg: 1000,
    defaultPriceEditLine: 500,
  },
  gilds: {
    patternClearName: /^[A-ZА-ЯЁa-zа-яё0-9_ ]{3,30}$/g,
    maxSizeName: 30,
    maxSizeDescription: 400,
    defaultPriceCreate: 10000,
    defaultPriceEditDesc: 1000,
    defaultPriceEditImg: 1000,
    defaultPriceBuyChannelText: 30000,
    defaultPriceBuyChannelVoice: 50000,
  },
  patternHexColor: /[0-9A-Fa-f]{6}/g,
};

// Проверка и создание таблиц базы данных до первого обращения
import './database';
