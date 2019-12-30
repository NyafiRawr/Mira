import * as players from './players';
import * as tools from './tools';

function selectApi(server) {
  const servers = tools.getData('osu!/servers');
  return require(`./osu-api/${servers[server].api.base}`);
}

export const getUser = (server, idOrName, mode = 0) =>
  selectApi(server).getUser(server, idOrName, mode);

export const getUserRecents = (server, idOrName, limit = 1, mode = 0) =>
  selectApi(server).getUserRecents(server, idOrName, limit, mode);

export const getUserTops = (server, idOrName, limit = 3, mode = 0) =>
  selectApi(server).getUserTops(server, idOrName, limit, mode);

export const getScores = (server, idOrName, idBeatmap, limit = 1, mode = 0) =>
  selectApi(server).getScores(server, idOrName, idBeatmap, limit, mode);

export const getBeatmap = (server, idBeatmap, mode = 0) =>
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

export const calculateAccuracy = (mode, count300, count100, count50,
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

export const getPlayerFromMessage = async (message, args) => {
  const parsingArgs = args.filter((arg) => arg.startsWith('/')).map((arg) => arg.substr(1));
  let specificServer;
  let specificMode;

  if (parsingArgs.length > 2) {
    message.reply(`много дополнительных параметров: \`${parsingArgs}\``);
    return null;
  }

  if (parsingArgs.length !== 0) {
    const servers = tools.getData('osu!/servers');
    const modes = tools.getData('osu!/modes');
    let element;

    while (parsingArgs.length !== 0) {
      element = parsingArgs.pop();

      if (specificServer === undefined) {
        if (Object.keys(servers).includes(element)) {
          specificServer = element;
        } else {
          // eslint-disable-next-line no-loop-func
          Object.keys(servers).forEach((server) => {
            if (servers[server].aliases.includes(element)) {
              specificServer = server;
            }
          });
        }
      }

      if (specificMode === undefined) {
        if (Object.keys(modes).includes(element)) {
          specificMode = element;
        } else {
          // eslint-disable-next-line no-loop-func
          Object.keys(modes).forEach((mode) => {
            if (modes[mode].aliases.includes(element)) {
              specificMode = mode;
            }
          });
        }
      }
    }

    if ((parsingArgs.length === 2 && !specificServer && !specificMode)
      || (!specificServer && !specificMode)) {
      message.reply(`дополнительные параметры указаны с ошибкой: ${args}
        \nСервер: ${specificServer}\nРежим: ${specificMode}`);
      return null;
    }
  }

  let player;

  if (message.mentions.members.size) {
    player = await players.get(message.mentions.members.first().id, message.guild.id);
    console.log(message.mentions.members);
    if (player === null) {
      player = {
        userId: message.mentions.members.first().id,
        gameServer: null,
        nickname: message.mentions.members.first().nickname,
        modes: null,
      };
    }
  } else {
    player = await players.get(message.author.id, message.guild.id);

    if (player === null) {
      player = {
        userId: message.author.id,
        gameServer: null,
        nickname: message.author.lastMessage.member.nickname || message.author.username,
        modes: null,
      };
    }

    let shouldBeNickname = args;
    const startParams = args.indexOf('/');
    if (startParams !== -1) {
      shouldBeNickname = args.slice(0, startParams);
    }

    if (shouldBeNickname.length) {
      player.nickname = shouldBeNickname.join(' ');
    }
  }

  player.gameServer = specificServer || player.server || 'bancho';
  player.modes = specificMode || player.modes || '0';

  return player;
};
