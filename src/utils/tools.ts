import { Message } from 'discord.js';
import config from '../config';
// Отделить тысячные
export const separateThousandth = (str?: string | number) => {
  if (str) {
    return str.toString().replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1,');
  }

  return '-';
};
// Принимает тип Date и преобразует к понятному виду
export const toDate = (value: string) => {
  const date = new Date(value);
  let day: any = date.getDate();

  if (day < 10) {
    day = `0${day}`;
  }

  let month: any = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }

  let minutes: any = date.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  let seconds: any = date.getSeconds();
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${day}.${month}.${date.getFullYear()} ${date.getHours()}:${minutes}:${seconds}`;
};
// Все первые буквы станут заглавными
export const toTitle = (str: string) =>
  str.replace(/\b\w/g, l => l.toUpperCase());
// Округлить до десятичных x знаков (по умолчанию: 2)
export const roundDecimalPlaces = (num: number, decimals = 2) => {
  const sign = num >= 0 ? 1 : -1;
  return (
    Math.round(num * 10 ** decimals + sign * 0.001) /
    10 ** decimals
  ).toFixed(decimals);
};
// Секунды в понятное время
export const convertSecondsToTime = (num: any) => {
  const value = num.toFixed();

  if (value > 3600) {
    const hours = Math.trunc(value / 3600);
    const minutes = Math.trunc((value - hours * 3600) / 60);
    if (minutes) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${hours} ч`;
  }
  if (value > 60) {
    return `${Math.trunc(value / 60)} мин`;
  }
  return `${value} сек`;
};
// Случайное целое
export const randomInteger = (minimum: number, maximum: number) => {
  const result = minimum - 0.5 + Math.random() * (maximum - minimum + 1);
  return Math.round(result);
};
// 1 или 0
export const randomBoolean = () => Math.random() >= 0.5;
// Случайный цвет #CCCCCC
export const randomHexColor = () =>
  `#${Math.random()
    .toString(16)
    .slice(2, 8)}`;
// Подпись для embed-сообщений: от кого запрос и название команды
export const embedFooter = (message: Message, nameCommand: string) => {
  const memberRequest = message.guild.members.get(message.author.id);
  return `Запрос от ${
    !memberRequest || !memberRequest.nickname
      ? message.author.username
      : memberRequest.nickname
    } | ${config.bot.prefix}${nameCommand}`;
};
// Получить файл name.json
export const getData = (name: string) =>
  require(`../../data/${name}.json`);
// Получить ключ из name.json у которого есть значение. Ключ может иметь массив значений
export const getDataKeyOnValue = (name: string, value: string) => {
  const data = getData(name);

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(data)) {
    if (data[key].includes(value)) {
      return key;
    }
  }

  return null;
};
// Получить значение по ключу из name.json
export const getDataValueOnKey = (name: string, key: string) => {
  const data = getData(name);

  if (key in data) {
    return data[key];
  }

  return null;
};
// Конвертер unix timestamp в дату
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
export const unixToDate = (unix_timestamp: number) => {
  const timestamp = new Date(unix_timestamp * 1000);
  const year = timestamp.getFullYear();
  const month = months[timestamp.getMonth()];
  const date = timestamp.getDate();
  const hour = timestamp.getHours();
  const min = timestamp.getMinutes();
  const sec = timestamp.getSeconds();
  return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
};
