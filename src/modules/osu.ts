import * as Discord from 'discord.js';
import * as players from './players';
import * as tools from './tools';
import Player from '../models/player';
import { log } from '../logger';

function selectApi(server: string) {
  const servers = tools.getData('osu!/servers');
  return require(`./osu-api/${servers[server].api.base}`);
}

export const getUser = (server: string, idOrName: string, mode = 0) =>
  selectApi(server).getUser(server, idOrName, mode);

export const getUserRecents = (
  server: string,
  idOrName: string,
  limit = 1,
  mode = 0
) => selectApi(server).getUserRecents(server, idOrName, limit, mode);

export const getUserTops = (
  server: string,
  idOrName: string,
  limit = 3,
  mode = 0
) => selectApi(server).getUserTops(server, idOrName, limit, mode);

export const getScores = (
  server: string,
  idOrName: string,
  idBeatmap: string,
  limit = 1,
  mode = 0
) => selectApi(server).getScores(server, idOrName, idBeatmap, limit, mode);

export const getBeatmap = (server: string, idBeatmap: string, mode = 0) =>
  selectApi(server).getBeatmap(server, idBeatmap, mode);

export const styleLengthInMS = (length: number): string => {
  const dt = new Date();
  dt.setTime(length * 1000);
  const seconds = dt.getUTCSeconds();
  if (seconds < 10) {
    return `${dt.getUTCMinutes()}:0${seconds}`;
  }
  return `${dt.getUTCMinutes()}:${seconds}`;
};

export const styleDatetimeInDMYHMS = (datetime: string): string => {
  const [date, time] = datetime.split(' ');
  const [year, month, day] = date.split('-');
  const [hours, minutes, seconds] = time.split(':');
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

export const calculateAccuracy = (
  mode: string,
  count300: string,
  count100: string,
  count50: string,
  countmiss: string,
  countkatu: string,
  countgeki: string
): number | null => {
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
  }
  if (parseInt(mode, 10) === 1) {
    userScore = parseInt(count100, 10) * 0.5;
    userScore += parseInt(count300, 10);
    totalScore = parseInt(countmiss, 10) + parseInt(count50, 10);
    totalScore += parseInt(count300, 10);
    totalScore += parseInt(count100, 10);
    return (userScore / totalScore) * 100;
  }
  if (parseInt(mode, 10) === 2) {
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
  }
  if (parseInt(mode, 10) === 3) {
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

export const showStats = (
  mode: string,
  count300: string,
  count100: string,
  count50: string,
  countmiss: string,
  countkatu: string,
  countgeki: string
) => {
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

export const decodeMods = (code: string) => {
  const mods = tools.getData('osu!/mods');
  let enCode = parseInt(code, 10);
  const result = [];

  for (let i = 0; i < Object.keys(mods).length; i += 1) {
    if (parseInt(Object.keys(mods)[i], 10) === enCode) {
      result.push(Object.values(mods)[i]);
      break;
    }

    const parsed = parseInt(Object.keys(mods)[i], 10);
    if (parsed > enCode) {
      enCode -= parsed;
      result.push(Object.values(mods)[i - 1]);
      i = 0;
    }
  }

  return result.join(', ');
};

export const getPlayerFromMessage = async (
  message: Discord.Message,
  args: string[]
) => {
  const parsingArgs = args
    .filter(arg => arg.startsWith('/'))
    .map(arg => arg.substr(1));
  let specificServer;
  let specificMode;

  if (parsingArgs.length > 2) {
    message.reply(`много дополнительных параметров: \`${parsingArgs}\``);
    return null;
  }

  if (parsingArgs.length !== 0) {
    const servers = tools.getData('osu!/servers');
    const modes = tools.getData('osu!/modes');
    let element: any;

    while (parsingArgs.length !== 0) {
      element = parsingArgs.pop();

      if (specificServer === undefined) {
        if (Object.keys(servers).includes(element)) {
          specificServer = element;
        } else {
          // eslint-disable-next-line no-loop-func
          Object.keys(servers).forEach(server => {
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
          Object.keys(modes).forEach(mode => {
            if (modes[mode].aliases.includes(element)) {
              specificMode = mode;
            }
          });
        }
      }
    }

    if (
      (!specificServer && !specificMode) ||
      (!specificServer && !specificMode)
    ) {
      message.reply(`дополнительные параметры указаны с ошибкой: ${args}
        \nСервер: ${specificServer}\nРежим: ${specificMode}`);
      return null;
    }
  }

  let player;

  if (message.mentions.members.size) {
    player = await players.get(
      message.mentions.members.first().id,
      message.guild.id
    );
    log.debug('Найдены ники в команде', message.mentions.members);
    if (player === null) {
      player = {
        userId: message.mentions.members.first().id,
        gameServer: null,
        nickname: message.mentions.members.first().nickname,
        modes: null,
      };
    }
  } else {
    player = await players.get<any>(message.author.id, message.guild.id);

    if (player === null) {
      player = {
        userId: message.author.id,
        gameServer: null,
        nickname:
          message.author.lastMessage.member.nickname || message.author.username,
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