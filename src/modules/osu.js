/* eslint-disable quote-props */
import axios from 'axios';
import config from '../config';
import * as users from './users';
import * as tools from './tools';

// debug axios requests
axios.interceptors.response.use((response) => {
  // tslint:disable-next-line:no-console
  console.log(
    response.status,
    response.request.method,
    response.request.res.responseUrl,
  );

  return response;
});

function getData(nameFileData) {
  return require(`../data/osu!/${nameFileData}.json`);
}

function getKeyOnValue(nameFileData, value) {
  const data = getData(nameFileData);

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(data)) {
    if (data[key].includes(value)) {
      return data[key][0];
    }
  }

  throw new Error();
}

export const getValueOnKey = (nameFileData, key) => {
  const data = getData(nameFileData);
  if (key in data) {
    return data[key];
  }
  return null;
};

export const get_user = async (idOrName, mode = 0, server = 'ppy') => {
  const result = await axios.get('/api/get_user', {
    baseURL: `http://${getKeyOnValue('server', server)}`,
    params: {
      m: mode,
      u: idOrName,
      k: server === 'ppy' ? config.osu_token : undefined,
    },
    transformResponse: [function (data) {
      return JSON.parse(data)[0];
    }],
  });
  return result.data;
};

export const get_user_recent = (idOrName, mode = 0, server = 'ppy') => {
  let url = `https://${getKeyOnValue('server', server)}/api/get_user_recent?m=${mode}&u=${idOrName}&limit=${1}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  return axios.get(url);
};

export const get_user_best = (idOrName, mode = 0, server = 'ppy', limit = 5) => {
  const limitMax = 10;

  let url = `https://${getKeyOnValue('server', server)}/api/get_user_best?m=${mode}&u=${idOrName}&limit=${limit > limitMax ? limitMax : limit}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  return axios.get(url);
};

export const get_scores = (idMap, idPlayer, mode = 0, server = 'ppy') => {
  let url = `https://${getKeyOnValue('server', server)}/api/get_scores?m=${mode}&b=${idMap}&u=${idPlayer}&limit=${1}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  return axios.get(url);
};

export const get_beatmap = (idMap, mode = 0, server = 'ppy') => {
  let url = `https://${getKeyOnValue('server', server)}/api/get_beatmaps?m=${mode}&b=${idMap}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  return axios.get(url);
};

export const convertLength = (length) => {
  const dt = new Date();
  dt.setTime(length * 1000);
  const seconds = dt.getUTCSeconds();
  if (seconds < 10) {
    return `${dt.getUTCMinutes()}:0${seconds}`;
  }
  return `${dt.getUTCMinutes()}:${seconds}`;
};

export const convertDatetime = (datetime) => {
  const [date, time] = datetime.split(' ');
  const [year, month, day] = date.split('-');
  // eslint-disable-next-line no-unused-vars
  const [hours, minutes, seconds] = time.split(':');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export const calculateAccuracity = (mode, count300, count100, count50,
  countmiss, countkatu, countgeki) => {
  let userScore;
  let totalScore;
  if (parseInt(mode, 10) === 0) {
    userScore = parseInt(count300, 10) * 300;
    userScore += parseInt(count100, 10) * 100;
    userScore += parseInt(count50, 10) * 50;
    totalScore = parseInt(count300, 10);
    totalScore += parseInt(count100, 10);
    totalScore += parseInt(count50, 10);
    totalScore += parseInt(countmiss, 10);
    totalScore *= 300;
    return (userScore / totalScore) * 100;
  } if (parseInt(mode, 10) === 1) {
    userScore = parseInt(count100, 10) * 0.5;
    userScore += parseInt(count300, 10);
    totalScore = parseInt(countmiss, 10) + parseInt(count50, 10);
    totalScore += parseInt(count300, 10);
    totalScore += parseInt(count100, 10);
    return (userScore / totalScore) * 100;
  } if (parseInt(mode, 10) === 2) {
    userScore = parseInt(count50, 10); // droplet!
    userScore += parseInt(count100, 10); // drop?
    userScore += parseInt(count300, 10); // fruit?
    totalScore = parseInt(countkatu, 10); // missed droplet!
    totalScore += parseInt(count100, 10); // missed drop?
    totalScore += parseInt(countgeki, 10); // missed fruit?
    totalScore += parseInt(count50, 10); // droplet!
    totalScore += parseInt(count100, 10); // drop?
    totalScore += parseInt(count300, 10); // fruit?
    return (userScore / totalScore) * 100;
  } if (parseInt(mode, 10) === 3) {
    userScore = parseInt(count50, 10) * 50;
    userScore += parseInt(count100, 10) * 100;
    userScore += parseInt(countkatu, 10) * 200;
    userScore += parseInt(count300, 10) * 300;
    userScore += parseInt(countgeki, 10) * 300;
    totalScore = parseInt(countgeki, 10);
    totalScore += parseInt(count300, 10);
    totalScore += parseInt(countkatu, 10);
    totalScore += parseInt(count100, 10);
    totalScore += parseInt(count50, 10);
    totalScore += parseInt(countmiss, 10);
    totalScore *= 300;
    return (userScore / totalScore) * 100;
  }
  return null;
};

export const showStatistic = (mode, count300, count100, count50,
  countmiss, countkatu, countgeki) => {
  const reCount300 = tools.separateThousandth(count300);
  const reCountgeki = tools.separateThousandth(countgeki);
  const reCount100 = tools.separateThousandth(count100);
  const reCountkatu = tools.separateThousandth(countkatu);
  const reCount50 = tools.separateThousandth(count50);
  const reCountmiss = tools.separateThousandth(countmiss);
  const reMode = parseInt(mode, 10);

  if (reMode === 0) {
    return `**300:** ${reCount300} **Geki:** ${reCountgeki}
                **100:** ${reCount100}    **Katu:** ${reCountkatu}
                **50:** ${reCount50}  **×:** ${reCountmiss}`;
  } if (reMode === 1) {
    return `**✪:** ${reCount300}   **⍟:** ${reCountgeki}
                **★:** ${reCount100}  **☆:** ${reCountkatu}
                **×:** ${reCount50}`;
  } if (reMode === 2) {
    return `**300:** ${reCount300} **×:** ${reCountgeki}
                **100:** ${reCount100}    **×:** ${reCountkatu}
                **50:** ${reCount50}  **×:** ${reCountmiss}`;
  } if (reMode === 3) {
    return `**MAX:** ${reCountgeki}   **300:** ${reCount300}
                **200:** ${reCountkatu}    **100:** ${reCount100}
                **50:** ${reCount50}  **×:** ${reCountmiss}`;
  }

  return '-';
};

function findPlayer(user, message) {
  const findedPlayer = users.get(message.guild.id, user.id);

  if (!findedPlayer.nick) {
    const member = message.guild.members.get(user.id);
    if (member.nickname) {
      findedPlayer.nick = member.nickname;
    } else {
      findedPlayer.nick = user.username;
    }
  }

  if (user.id !== message.author.id) {
    const requestPlayer = users.get(message.guild.id, message.author.id);

    if (!findedPlayer.mode) {
      findedPlayer.mode = requestPlayer.mode;
    }

    if (!findedPlayer.server) {
      findedPlayer.server = requestPlayer.server;
    }
  }

  if (!findedPlayer.mode) {
    findedPlayer.mode = 0;
  }

  if (!findedPlayer.server) {
    findedPlayer.server = 'ppy';
  }

  return { ...findedPlayer };
}

export const searchPlayer = (message, args) => {
  const reArgs = args.join(' ');
  let player = {};

  if (message.mentions.users.size) {
    player = findPlayer(message.mentions.users.first(), message);
  } else {
    player = findPlayer(message.author, message);

    if (reArgs.length) {
      player.nick = reArgs;
    }
  }

  return player;
};

export const getModsFromJson = (code) => {
  // eslint-disable-next-line import/no-webpack-loader-syntax
  const mods = require('./../data/osu!/mods.json');
  let reCode = parseInt(code, 10);
  const result = [];

  for (let i = 0; i < Object.keys(mods).length; i += 1) {
    if (parseInt(Object.keys(mods)[i], 10) === reCode) {
      result.push(Object.values(mods)[i]);
      break;
    }

    if (parseInt(Object.keys(mods)[i], 10) > reCode) {
      reCode -= Object.keys(mods)[i - 1];
      result.push(Object.values(mods)[i - 1]);
      i = 0;
    }
  }

  return result.join(', ');
};

export const getKeyFromSearchOnValueFromJson = (filename, value) => {
  const list = require(`../data/osu!/${filename}.json`);
  let searchResult = false;
  let result;

  // eslint-disable-next-line no-restricted-syntax
  for (const key in list) {
    if (list[key].includes(value)) {
      result = key;
      searchResult = true;
      return { result, searchResult };
    }
  }

  result = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const key in list) {
    if (Array.isArray(list[key])) {
      result.push(list[key].join(', '));
    } else {
      result.push(list[key]);
    }
  }
  result = `~~${value}~~ нет. Но есть: ${result.join(', ')}.`;

  return { result, searchResult };
};

export const getValueOnKeyFromJson = (filename, key) => {
  const list = require(`../data/osu!/${filename}.json`);

  const result = list[key];

  return Array.isArray(result) ? result[0] : result;
};
