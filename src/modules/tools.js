import fs from 'fs';
import config from '../config';

const logErrorFile = './errors.log';

export const getValueOnKeyFromJson = (filename, key) => {
  // todo: сделать чтение нужных файлов напрямую из файлов-команд
  const list = require(`../data/${filename}.json`);

  const result = list[key];

  if (Array.isArray(result)) {
    return result[0];
  }

  return key;
};

export const getKeyOnValueFromJson = (filename, value) => {
  const list = require(`../data/${filename}.json`);

  // eslint-disable-next-line no-restricted-syntax
  for (const key of list) {
    if (list[key].includes(value)) {
      return key;
    }
  }

  return value;
};

export const separateThousandth = (number) => {
  if (number) {
    return number.toString().replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1,');
  }
  return '-';
};


export const toDate = (value) => {
  const date = new Date(value);
  let day = date.getDate();

  if (day < 10) {
    day = `0${day}`;
  }

  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }

  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  let seconds = date.getSeconds();
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${day}.${month}.${date.getFullYear()} ${date.getHours()}:${minutes}:${seconds}`;
};

export const toTitle = (string) => string.replace(/\b\w/g, (l) => l.toUpperCase());

export const toTwoDecimalPlaces = (num, decimals = 2) => {
  const sign = num >= 0 ? 1 : -1;
  return (Math.round((num * 10 ** decimals) + (sign * 0.001)) / 10 ** decimals).toFixed(decimals);
};

export const convertSecondsToTime = (num) => {
  const value = num.toFixed();

  if (value > 3600) {
    const hours = Math.trunc(value / 3600);
    const minutes = Math.trunc((value - (hours * 3600)) / 60);
    if (minutes) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${hours} ч`;
  } if (value > 60) {
    return `${Math.trunc(value / 60)} мин`;
  }
  return `${value} сек`;
};

export const randomInteger = (minimum, maximum) => {
  const result = minimum - 0.5 + Math.random() * (maximum - minimum + 1);
  return Math.round(result);
};

export const randomBoolean = () => Math.random() >= 0.5;

export const randomHexColor = () => `#${Math.random().toString(16).slice(2, 8)}`;

export const myFooter = (message, nameCommand) => {
  const memberRequest = message.guild.members.get(message.author.id);
  return `Запрос от ${(!memberRequest || !memberRequest.nickname) ? message.author.username : memberRequest.nickname} | ${config.bot.prefix}${nameCommand}`;
};

export const logError = (e) => {
  fs.appendFileSync(logErrorFile, `\n\n${e}`, (error) => {
    if (error) {
      console.log('Не удалось записать ошибку:\n', logErrorFile, '\n\nпотому что:\n\n', error);
    }
    console.log('Ошибка записана в ', logErrorFile);
  });
};
