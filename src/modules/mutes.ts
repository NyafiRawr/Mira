import MuteWarningList from '../models/MuteWarningList';
import MuteWarningTerm from '../models/MuteWarningTerm';
import MuteList from '../models/MuteList';
import * as vars from '../modules/vars';
import { Op } from 'sequelize';
import { log } from '../logger';
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { client } from '../client';
import config from '../config';
import { timeFomattedDHMS, timeFomattedDMYHHMMSS } from '../utils';

export const minutesCheckReleases = 60;
const timeoutCheckReleases = minutesCheckReleases * 60 * 1000;
const prisonIncrease = 24 * 60 * 60 * 1000; // +1 день за выход с сервера с мутом
const reasonBadWord = 'Запрещенное слово';

//#region Warns

export const getWarns = async (serverId: string, userId: string) =>
  MuteWarningList.findAll({
    where: {
      serverId,
      userId,
    },
  });

export const setWarn = async (
  serverId: string,
  userId: string,
  reason: string,
  executorId: string,
  channelName: string
): Promise<MessageEmbed> => {
  await MuteWarningList.create({
    serverId,
    userId,
    reason,
    executorId,
    channelName,
  });

  return new MessageEmbed({
    color: '#feeb01',
    author: {
      name: 'Система предупреждений',
    },
    description: `Участник <@${userId}> получает предупреждение`,
    fields: [
      { name: 'Модератор', value: `<@${executorId}>`, inline: true },
      { name: 'Причина', value: reason, inline: true },
    ],
  });
};

export const removeWarn = async (
  serverId: string,
  userId: string,
  reason: string,
  executorId: string,
  warnId: number
): Promise<MessageEmbed | null> => {
  const warn = await MuteWarningList.findOne({
    where: { serverId, id: warnId },
  });

  if (warn === null) {
    return null;
  }

  await warn.destroy();

  return new MessageEmbed({
    color: '#00ff40',
    author: {
      name: 'Система предупреждений',
    },
    description: `Удалено предупреждение участника **<@${userId}>** с **ID: ${warnId}**`,
    fields: [
      { name: 'Модератор', value: `<@${executorId}>`, inline: true },
      { name: 'Причина', value: reason, inline: true },
    ],
  });
};

//#endregion

//#region Mute Role

export const setMuteRoleId = async (
  serverId: string,
  roleId: string
): Promise<void> => {
  const role = await vars.getOne(serverId, 'mute_role');

  if (role !== null) {
    await role.update({ value: roleId });
  } else {
    await vars.set(serverId, 'mute_role', roleId);
  }
};

export const removeMuteRoleId = async (serverId: string): Promise<boolean> => {
  const role = await vars.getOne(serverId, 'mute_role');

  if (role !== null) {
    await role.destroy();
    return true;
  }

  return false;
};

export const getMuteRoleId = async (
  serverId: string
): Promise<string | null> => {
  const role = await vars.getOne(serverId, 'mute_role');
  return role?.value || null;
};

export const returnMuteRole = async (guildMember: GuildMember) => {
  if (guildMember.user.bot) {
    return;
  }

  let mute = await getMute(guildMember.guild.id, guildMember.user.id);
  if (mute) {
    const roleId = await getMuteRoleId(guildMember.guild.id);
    if (roleId) {
      await guildMember.roles.add(roleId);
      if (mute.releaseDate.getTime() <= Date.now()) {
        mute = await mute.update({
          releaseDate: Date.now() + prisonIncrease,
        });
      } else {
        mute = await mute.update({
          releaseDate: mute.releaseDate.getTime() + prisonIncrease,
        });
      }
      await guildMember
        .send(
          `С возвращением! Выход с сервера с ролью молчания +1 день к сроку заключения: ${timeFomattedDMYHHMMSS(
            mute.releaseDate.getTime()
          )}`
        )
        .catch(/* ЛС ЗАКРЫТО */);
    }
  }
};

//#endregion

//#region Mute Term

export const getTerm = async (
  serverId: string,
  countWarnings: number,
  forDays: number
): Promise<MuteWarningTerm | null> =>
  MuteWarningTerm.findOne({
    where: { serverId, countWarnings, forDays },
  });

export const getTerms = async (serverId: string) =>
  MuteWarningTerm.findAll({
    where: { serverId },
  });

export const setTerm = async (
  serverId: string,
  countWarnings: number,
  forDays: number,
  timestamp: number
): Promise<MuteWarningTerm> => {
  const term = await getTerm(serverId, countWarnings, forDays);

  if (term !== null) {
    return term.update({
      timestamp,
    });
  }

  return MuteWarningTerm.create({
    serverId,
    countWarnings,
    forDays,
    timestamp,
  });
};

export const removeTerm = async (
  serverId: string,
  countWarnings: number,
  forDays: number
): Promise<boolean> => {
  const term = await getTerm(serverId, countWarnings, forDays);

  if (term !== null) {
    term.destroy();
    return true;
  }

  return false;
};

export const checkTermForMute = async (
  serverId: string,
  userId: string
): Promise<MuteWarningTerm | null> => {
  const terms = await MuteWarningTerm.findAll({ where: { serverId } });
  if (terms.length === 0) {
    return null;
  }

  // Сортировка: 1 - варны (так как можно получить кучу за один день) 2 - дни
  terms
    .sort((a, b) => a.forDays - b.forDays)
    .sort((a, b) => b.countWarnings - a.countWarnings);

  for await (const term of terms) {
    const countWarnings = await MuteWarningList.findAll({
      where: {
        serverId,
        userId,
        date: {
          [Op.gte]: Date.now() - term.forDays * 86400000,
        },
      },
    });

    if (countWarnings.length >= term.countWarnings) {
      return term;
    }
  }

  return null;
};

//#endregion

//#region Mutes

export const getMutes = async (serverId: string) =>
  MuteList.findAll({
    where: {
      serverId,
    },
  });

export const getMute = async (serverId: string, userId: string) =>
  MuteList.findOne({ where: { serverId, userId } });

export const setMute = async (
  serverId: string,
  userId: string,
  reason: string,
  executorId: string,
  channelName: string,
  timestamp: number
): Promise<MessageEmbed> => {
  let mute = await getMute(serverId, userId);

  if (mute === null) {
    mute = await MuteList.create({
      serverId,
      userId,
      reason,
      executorId,
      channelName,
      releaseDate: new Date(Date.now() + timestamp),
    });
  } else {
    mute = await mute.update({
      releaseDate: new Date(mute.releaseDate.getTime() + timestamp),
    });
  }

  return new MessageEmbed({
    color: '#ff0000',
    author: {
      name: 'Система предупреждений',
    },
    description: `Участник <@${userId}> получает мут`,
    fields: [
      { name: 'Модератор', value: `<@${executorId}>`, inline: true },
      { name: 'Причина', value: reason, inline: true },
      { name: 'Срок', value: `${timeFomattedDHMS(timestamp)}`, inline: true },
    ],
    footer: {
      text: `Мут будет снят: ${timeFomattedDMYHHMMSS(
        mute.releaseDate.getTime()
      )}`,
    },
  });
};

export const removeMute = async (
  serverId: string,
  userId: string,
  reason: string,
  executorId: string
): Promise<MessageEmbed | null> => {
  const mute = await getMute(serverId, userId);

  if (mute === null) {
    return null;
  }

  await mute.destroy();

  return new MessageEmbed({
    color: '#00ff40',
    author: {
      name: 'Система предупреждений',
    },
    description: `С участника <@${userId}> снят мут`,
    fields: [
      { name: 'Модератор', value: `<@${executorId}>`, inline: true },
      { name: 'Причина', value: reason, inline: true },
    ],
    footer: {
      text: `До конца срока оставалось: ${timeFomattedDHMS(
        mute.releaseDate.getTime() - Date.now()
      )}`,
    },
  });
};

export const checkReleases = async () => {
  log.info('[Муты] Начата проверка сроков заключения...');

  const mutes = await MuteList.findAll({
    where: { releaseDate: { [Op.lt]: Date.now() } },
  });
  for await (const mute of mutes) {
    const roleId = await getMuteRoleId(mute.serverId);
    if (roleId !== null) {
      const user = await client.guilds.cache
        .get(mute.serverId)
        ?.members.fetch(mute.userId);
      await user?.roles.remove(roleId).catch();
    }

    await removeMute(
      mute.serverId,
      mute.userId,
      'Мут закончился',
      client.user?.id || config.author.discord.id
    );
  }

  log.info(`[Муты] Проверка завершена, удалено мутов: ${mutes.length}`);

  setTimeout(async () => {
    await checkReleases();
  }, timeoutCheckReleases);
};

//#endregion

//#region Filter Bad Words

export const getBadWords = async (
  serverId: string
): Promise<string[] | null> => {
  const variable = await vars.getOne(serverId, 'warn_bad_words');
  return variable?.value.split(',') || null;
};

export const addBadWords = async (
  serverId: string,
  newWords: string[]
): Promise<string[]> => {
  let variable = await vars.getOne(serverId, 'warn_bad_words');

  const words = newWords.map((word) => word.toLowerCase());
  if (variable !== null) {
    const oldWords = variable.value.split(',');
    const union = words.concat(oldWords);
    const unique = union.filter((word, index) => union.indexOf(word) === index);
    variable = await variable.update({ value: unique.toString() });
  } else {
    variable = await vars.set(serverId, 'warn_bad_words', words.toString());
  }

  return variable.value.split(',');
};

export const removeBadWords = async (
  serverId: string,
  removeWords: string[]
): Promise<string[]> => {
  const variable = await vars.getOne(serverId, 'warn_bad_words');
  if (variable === null) {
    return [];
  }
  const words = variable.value.split(',');

  const different = words.filter(
    (word) => removeWords.includes(word) === false
  );

  if (different.length === 0) {
    await variable.destroy();
    return [];
  }

  await variable.update({ value: different.toString() });

  return different;
};

export const getBadChannels = async (
  serverId: string
): Promise<string[] | null> => {
  const variable = await vars.getOne(serverId, 'warn_bad_channels');
  return variable?.value.split(',') || null;
};

export const addBadChannels = async (
  serverId: string,
  newChannels: string[]
): Promise<string[]> => {
  const variable = await vars.getOne(serverId, 'warn_bad_channels');

  let channels;
  if (variable === null) {
    channels = await vars.set(
      serverId,
      'warn_bad_channels',
      newChannels.toString()
    );
  } else {
    const oldChannels = variable.value.split(',');
    const union = newChannels.concat(oldChannels);
    const unique = union.filter(
      (channel, index) => union.indexOf(channel) === index
    );
    channels = await variable.update({ value: unique.toString() });
  }

  return channels.value.split(',');
};

export const removeBadChannels = async (
  serverId: string,
  removeChannels: string[]
): Promise<string[]> => {
  const variable = await vars.getOne(serverId, 'warn_bad_channels');
  if (variable === null) {
    return [];
  }
  const channels = variable.value.split(',');

  const different = channels.filter(
    (channel) => removeChannels.includes(channel) === false
  );

  if (different.length === 0) {
    await variable.destroy();
    return [];
  }

  await variable.update({ value: different.toString() });

  return different;
};

// TODO: Кэширование для оптимизации сравнений
export const checkBadWords = async (message: Message): Promise<void> => {
  if (
    message.guild === null ||
    message.author.bot ||
    (message.channel as TextChannel).nsfw
  ) {
    return;
  }

  const channels = await getBadChannels(message.guild.id);
  if (channels?.some((id) => id === message.channel.id)) {
    return;
  }

  const badWords = await getBadWords(message.guild.id);
  if (badWords === null) {
    return;
  }

  const content = message.content.toLowerCase().split(' ');

  const haveBadWord = content.some((word) => badWords.includes(word));
  if (haveBadWord) {
    await message.delete({ reason: reasonBadWord });

    const embed = await setWarn(
      message.guild.id,
      message.author.id,
      reasonBadWord,
      client.user?.id || config.author.discord.id,
      message.channel.toString()
    );

    await message.channel.send(message.author, embed);

    const muteTerm = await checkTermForMute(
      message.guild!.id,
      message.author.id
    );
    if (muteTerm !== null) {
      const roleId = await getMuteRoleId(message.guild.id);
      if (roleId !== null) {
        await message.member!.roles.add(roleId);
        const muteEmbed = await setMute(
          message.guild!.id,
          message.author.id,
          `Получено ${muteTerm.countWarnings} предупреждений за ${muteTerm.forDays} дней`,
          message.client.user?.id || config.author.discord.id,
          message.channel.toString(),
          muteTerm.timestamp
        );
        await message.channel.send(message.author, muteEmbed);
      }
    }
  }
};

//#endregion
