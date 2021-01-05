import axios from 'axios';

// Случайное целое
export const randomInteger = (minimum: number, maximum: number): number => {
  const result = minimum - 0.5 + Math.random() * (maximum - minimum + 1);
  return Math.round(result);
};

// Случайное: 1 или 0
export const randomBoolean = (): boolean => Math.random() >= 0.5;

// Случайный цвет в формате: #CCCCCC
export const randomHexColor = (): string =>
  `#${Math.random().toString(16).slice(2, 8)}`;

// Округлить до десятичных N знаков (по умолчанию: 2)
export const roundDecimalPlaces = (num: number, decimals = 2) => {
  const sign = num >= 0 ? 1 : -1;
  return (
    Math.round(num * 10 ** decimals + sign * 0.001) /
    10 ** decimals
  ).toFixed(decimals);
};

// Приведение числа к виду двузначного ##
const toTwoDigit = (value: number): string => {
  return value < 10 ? `0${value}` : `${value}`;
};

// Приведение unix_time к виду D д H ч M м 0 S
export const timeFomattedDHMS = (unix_time: number): string => {
  let totalSeconds = unix_time / 1000;
  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${days} д ${hours} ч ${minutes} м ${seconds} с`;
};

// Приведение unix_time к виду ДД месяц ГГГГ ЧЧ:ММ:СС
const months = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];
export const timeFomattedDMYHHMMSS = (unix_time: number): string => {
  const timestamp = new Date(unix_time);
  const year = timestamp.getFullYear();
  const month = months[timestamp.getMonth()];
  const date = timestamp.getDate();
  const hour = timestamp.getHours();
  const min = timestamp.getMinutes();
  const sec = timestamp.getSeconds();
  return `${date} ${month} ${year} ${toTwoDigit(hour)}:${toTwoDigit(
    min
  )}:${toTwoDigit(sec)}`;
};

// Приведение unix_time к виду ДД месяц ГГГГ
export const timeFomattedDMY = (unix_time: number): string => {
  const timestamp = new Date(unix_time);
  const year = timestamp.getFullYear();
  const month = months[timestamp.getMonth()];
  const date = timestamp.getDate();
  return `${date} ${month} ${year}`;
};

// Вычисление прошедшего времени в виде Г лет М месяцев Д дней
export const timeLifeFormattedYMD = (unix_time: number) => {
  const difference = new Date(Date.now() - unix_time);

  const year = difference.getFullYear() - 1970;
  const month = difference.getMonth();
  const day = difference.getDate();

  let date = '';
  if (year != 0) {
    date += `${year}`;
    if (year % 10 == 1 && year != 11) {
      date += ` год `;
    } else if (year % 10 > 1 && year % 10 < 5) {
      date += ` года `;
    } else {
      date += ` лет `;
    }
  }
  if (month != 0) {
    date += `${month}`;
    if (month % 10 == 1 && month != 11) {
      date += ` месяц `;
    } else if (month > 1 && month < 5) {
      date += ` месяца `;
    } else {
      date += ` месяцев `;
    }
  }
  if (day != 0) {
    date += `${day}`;
    if (day % 10 == 1 && day != 11) {
      date += ` день `;
    } else if (day % 10 > 1 && day % 10 < 5) {
      date += ` дня `;
    } else {
      date += ` дней `;
    }
  }

  return date;
};

// Отделить тысячные
export const separateThousandth = (str?: string): string => {
  if (str === undefined) {
    return '-';
  }
  return str.replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1,');
};

// Все первые буквы станут заглавными
export const toTitle = (str: string): string =>
  str.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });

// Сверка начала строки с https?|ftp
export const isUrl = (url: string): boolean => {
  const pattern = new RegExp('^(https?|ftp)://');
  if (pattern.test(url)) {
    return true;
  }
  return false;
};

// Проверка доступности URL и его содержимого
export const checkUrl = async (
  url: string,
  contentType: string | null = null
): Promise<boolean> => {
  try {
    const result = await axios.head(url);
    if (contentType) {
      if (result.headers['content-type'].match(contentType) === null) {
        return false;
      }
    }
  } catch (error) {
    return false;
  }

  return true;
};

// Приведение секунд к виду: MM:SS
export const secondsFormattedMMSS = (seconds: number): string => {
  const ss = seconds % 60;
  const mm = (seconds - ss) / 60;
  return `${mm}:${toTwoDigit(ss)}`;
};

// Приведение секунд к виду: HH:MM:SS
export const secondsFormattedHHMMSS = (seconds: number): string => {
  const ss = seconds % 60;
  const hhmm = (seconds - ss) / 60;
  const mm = hhmm % 60;
  const hh = (hhmm - mm) / 60;
  return `${toTwoDigit(hh)}:${toTwoDigit(mm)}:${toTwoDigit(ss)}`;
};

// Приведение секунд к виду: H ч? M мин? S сек
export const secondsFormattedHMS = (seconds: number): string => {
  if (seconds > 3600) {
    const hours = Math.trunc(seconds / 3600);
    const minutes = Math.trunc((seconds - hours * 3600) / 60);
    if (minutes) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${hours} ч`;
  }
  if (seconds > 60) {
    return `${Math.trunc(seconds / 60)} мин`;
  }
  return `${seconds} сек`;
};
