import fs from 'fs';
import config from '../config';

const logErrorFile = './errors.log';

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

export const roundDecimalPlaces = (num, decimals = 2) => {
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

export const embedFooter = (message, nameCommand) => {
  const memberRequest = message.guild.members.get(message.author.id);
  return `Запрос от ${(!memberRequest || !memberRequest.nickname) ? message.author.username : memberRequest.nickname} | ${config.bot.prefix}${nameCommand}`;
};

export const logError = (content, comment = null) => {
  if (comment != null) {
    console.log(comment);
  }
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  fs.appendFileSync(logErrorFile, `${date} ${time}\n${comment}\n${content}\n\n`, (error) => {
    if (error) {
      console.log(`Не удалось записать ошибку:\n${content}\n\nпотому что:\n\n${error}`);
    }
  });
};

export const getData = (pathData) => require(`../data/${pathData}.json`);

export const getDataKeyOnValue = (pathData, value) => {
  const data = getData(pathData);

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(data)) {
    if (data[key].includes(value)) {
      return key;
    }
  }

  return null;
};

export const getDataValueOnKey = (pathData, key) => {
  const data = getData(pathData);

  if (key in data) {
    return data[key];
  }

  return null;
};
