/* eslint-disable implicit-arrow-linebreak */
import * as players from './players';
import * as tools from './tools';

function selectApi(server) {
  const servers = tools.getData('osu!/servers');
  return require(`./osu-api/${servers[server].api}`);
}

export const getUser = (server, idOrName, mode = 0) =>
  selectApi(server).getUser(server, idOrName, mode);

export const getUserRecent = (server, idOrName, limit = 1, mode = 0) =>
  selectApi(server).getUserRecent(server, idOrName, limit, mode);

export const getUserTop = (server, idOrName, limit = 3, mode = 0) =>
  selectApi(server).getUserTop(server, idOrName, limit, mode);

export const getScores = (server, idBeatmap, idOrName, limit = 1, mode = 0) =>
  selectApi(server).getScores(server, idBeatmap, idOrName, limit, mode);

export const getBeatmap = (idBeatmap, server, mode = 0) =>
  selectApi(server).getBeatmap(server, idBeatmap, mode);

export const styleLengthInMS = (length) => {
  const dt = new Date();
  dt.setTime(length * 1000);
  const seconds = dt.getUTCSeconds();
  if (seconds < 10) {
    return `${dt.getUTCMinutes()}:0${seconds}`;
  }
  return `${dt.getUTCMinutes()}:${seconds}`;
};

export const styleDatetimeInDMYHMS = (datetime) => {
  const [date, time] = datetime.split(' ');
  const [year, month, day] = date.split('-');
  const [hours, minutes, seconds] = time.split(':');
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
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

export const showStats = (mode, count300, count100, count50,
  countmiss, countkatu, countgeki) => {
  const reMode = parseInt(mode, 10);

  const template = tools.getData('osu!/stats');

  return template[reMode]
    .join('\n')
    .replace('count300', tools.separateThousandth(count300))
    .replace('countgeki', tools.separateThousandth(countgeki))
    .replace('count100', tools.separateThousandth(count100))
    .replace('countkatu', tools.separateThousandth(countkatu))
    .replace('count50', tools.separateThousandth(count50))
    .replace('countmiss', tools.separateThousandth(countmiss));
};

export const decodeMods = (code) => {
  const mods = tools.getData('osu!/mods');
  let enCode = parseInt(code, 10);
  const result = [];

  for (let i = 0; i < Object.keys(mods).length; i += 1) {
    if (parseInt(Object.keys(mods)[i], 10) === enCode) {
      result.push(Object.values(mods)[i]);
      break;
    }

    if (parseInt(Object.keys(mods)[i], 10) > enCode) {
      enCode -= Object.keys(mods)[i - 1];
      result.push(Object.values(mods)[i - 1]);
      i = 0;
    }
  }

  return result.join(', ');
};

function findPlayer(user, message) {
  const findedPlayer = players.get(message.guild.id, user.id);

  if (!findedPlayer.nick) {
    const member = message.guild.members.get(user.id);
    if (member.nickname) {
      findedPlayer.nick = member.nickname;
    } else {
      findedPlayer.nick = user.username;
    }
  }

  if (user.id !== message.author.id) {
    const requestPlayer = players.get(message.guild.id, message.author.id);

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
    findedPlayer.server = 'bancho';
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
