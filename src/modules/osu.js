import * as users from './users';
import config from '../config';

const request = require('sync-request');
const tools = require('./tools.js');

module.exports.get_user = (idOrName, mode = 0, server = 'ppy') => {
  let url = `https://${tools.getValueOnKeyFromJson('server', server)}/api/get_user?m=${mode}&u=${idOrName}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  const res = request('GET', url);
  return JSON.parse(res.getBody('utf8'));
};

module.exports.get_user_recent = (idOrName, mode = 0, server = 'ppy') => {
  let url = `https://${this.getValueOnKeyFromJson('server', server)}/api/get_user_recent?m=${mode}&u=${idOrName}&limit=${1}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  const res = request('GET', url);
  return JSON.parse(res.getBody('utf8'));
};

module.exports.get_user_best = (idOrName, mode = 0, server = 'ppy', limit = 5) => {
  if (limit > 10) {
    limit = 10;
  }

  let url = `https://${this.getValueOnKeyFromJson('server', server)}/api/get_user_best?m=${mode}&u=${idOrName}&limit=${limit}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  const res = request('GET', url);
  return JSON.parse(res.getBody('utf8'));
};

module.exports.get_scores = (idMap, idPlayer, mode = 0, server = 'ppy') => {
  let url = `https://${this.getValueOnKeyFromJson('server', server)}/api/get_scores?m=${mode}&b=${idMap}&u=${idPlayer}&limit=${1}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  const res = request('GET', url);
  return JSON.parse(res.getBody('utf8'));
};

module.exports.get_beatmap = (idMap, mode = 0, server = 'ppy') => {
  let url = `https://${this.getValueOnKeyFromJson('server', server)}/api/get_beatmaps?m=${mode}&b=${idMap}`;

  if (server === 'ppy') {
    url += `&k=${config.osu_token}`;
  }

  const res = request('GET', url);
  return JSON.parse(res.getBody('utf8'));
};

module.exports.convertLength = (length) => {
  const dt = new Date();
  dt.setTime(length * 1000);
  const seconds = dt.getUTCSeconds();
  if (seconds < 10) {
    return `${dt.getUTCMinutes()}:0${seconds}`;
  }
  return `${dt.getUTCMinutes()}:${seconds}`;
};

module.exports.convertDatetime = (datetime) => {
  const [date, time] = datetime.split(' ');
  const [year, month, day] = date.split('-');
  // eslint-disable-next-line no-unused-vars
  const [hours, minutes, seconds] = time.split(':');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

module.exports.calculateAccuracity = (mode, count300, count100, count50, countmiss, countkatu, countgeki) => {
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
    return userScore / totalScore * 100;
  } if (parseInt(mode, 10) === 1) {
    userScore = parseInt(count100, 10) * 0.5;
    userScore += parseInt(count300, 10);
    totalScore = parseInt(countmiss, 10) + parseInt(count50, 10);
    totalScore += parseInt(count300, 10);
    totalScore += parseInt(count100, 10);
    return userScore / totalScore * 100;
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
    return userScore / totalScore * 100;
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
    return userScore / totalScore * 100;
  }
  return null;
};

module.exports.showStatistic = (mode, count300, count100, count50, countmiss, countkatu, countgeki) => {
  count300 = tools.separateThousandth(count300);
  countgeki = tools.separateThousandth(countgeki);
  count100 = tools.separateThousandth(count100);
  countkatu = tools.separateThousandth(countkatu);
  count50 = tools.separateThousandth(count50);
  countmiss = tools.separateThousandth(countmiss);
  mode = parseInt(mode, 10);

  if (mode === 0) {
    return `**300:** ${count300} **Geki:** ${countgeki}
                **100:** ${count100}    **Katu:** ${countkatu}
                **50:** ${count50}  **×:** ${countmiss}`;
  } if (mode === 1) {
    return `**✪:** ${count300}   **⍟:** ${countgeki}
                **★:** ${count100}  **☆:** ${countkatu}
                **×:** ${count50}`;
  } if (mode === 2) {
    return `**300:** ${count300} **×:** ${countgeki}
                **100:** ${count100}    **×:** ${countkatu}
                **50:** ${count50}  **×:** ${countmiss}`;
  } if (mode === 3) {
    return `**MAX:** ${countgeki}   **300:** ${count300}
                **200:** ${countkatu}    **100:** ${count100}
                **50:** ${count50}  **×:** ${countmiss}`;
  }

  return '-';
};

module.exports.searchPlayer = (message, args) => {
  if (Array.isArray(args)) {
    args = args.join(' ');
  }

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

  let player = {};

  if (message.mentions.users.size) {
    player = findPlayer(message.mentions.users.first(), message);
  } else {
    player = findPlayer(message.author, message);

    if (args.length) {
      player.nick = args;
    }
  }

  return player;
};

module.exports.getModsFromJson = (code) => {
  // eslint-disable-next-line import/no-webpack-loader-syntax
  const mods = require('./../data/osu!/mods.json');
  code = parseInt(code, 10);
  const result = [];

  for (let i = 0; i < Object.keys(mods).length; i++) {
    if (parseInt(Object.keys(mods)[i], 10) === code) {
      result.push(Object.values(mods)[i]);
      break;
    }

    if (parseInt(Object.keys(mods)[i], 10) > code) {
      code -= Object.keys(mods)[i - 1];
      result.push(Object.values(mods)[i - 1]);
      i = 0;
    }
  }

  return result.join(', ');
};

module.exports.getKeyFromSearchOnValueFromJson = (filename, value) => {
  const list = require(`../data/osu!/${filename}.json`);
  let searchResult = false;
  let result;

  for (key in list) {
    if (list[key].includes(value)) {
      result = key;
      searchResult = true;
      return { result, searchResult };
    }
  }

  result = [];

  for (key in list) {
    if (Array.isArray(list[key])) {
      result.push(list[key].join(', '));
    } else {
      result.push(list[key]);
    }
  }
  result = `~~${value}~~ нет. Но есть: ${result.join(', ')}.`;

  return { result, searchResult };
};

module.exports.getValueOnKeyFromJson = (filename, key) => {
  const list = require(`../data/osu!/${filename}.json`);

  let result = list[key];

  if (Array.isArray(result)) {
    result = result[0];
  }

  return result || key;
};
