import Warning from '../models/warning';
import * as Discord from 'discord.js';
import * as vars from '../modules/vars';
import moment = require('moment');
import { Op } from 'sequelize';
import * as mutes from '../modules/mutes';
import Punch from '../models/punch';

// НАКАЗАНИЯ

export const setPunch = async (
  serverId: string,
  countWarns: number,
  termDays: number | undefined = 0,
  timeMuteMs: number | undefined = 0
) => {
  if (!termDays && !timeMuteMs)
    await Punch.destroy({ where: { serverId, countWarns, termDays } });
  else
    await Punch.create({
      serverId,
      countWarns,
      termDays,
      timeMuteMs
    });
};

export const checkPunch = async (
  serverId: string,
  victimId: string
) => {
  const punches = await Punch.findAll({ where: { serverId } });
  if (!punches) {
    /*const warns = Warning.findAll({
      where: {
        serverId,
        userId: victimId,
        date: {
          [Op.gte]: moment().subtract(3, 'days').toDate()
        }
      }
    });

    await mutes.punch(serverId, victimId, punch.timeMuteMs, `Получено ${countWarns} предупреждений`);*/
  }
};

// TODO: назначать последнее наказание если countWarns > n

// ВЫДАЧА ВАРНОВ И МУТА ПО НАКОПЛЕНИЮ

export const set = async (
  serverId: string,
  victimId: string,
  reason: string
) => {
  await Warning.create({
    serverId,
    userId: victimId,
    reason
  });

  await checkPunch(serverId, victimId);
};

export const msg = (
  victim: Discord.GuildMember,
  reason: string
) => ({
  'embed': {
    'author': {
      'name': `${victim.user.username + '#' + victim.user.discriminator} получает предупреждение`,
      'icon_url': victim.user.avatarURL
    },
    'description': `**Причина:** ${reason}`,
  }
});

// ФИЛЬТР ПЛОХИХ СЛОВ

const keyBadWords = 'warning_badwords';

export const getBadWords = async (
  serverId: string
): Promise<string[]> => (await vars.get(serverId, keyBadWords))?.split(' ') || [];

export const setBadWords = async (
  serverId: string,
  words: string[],
  addOrDelete: boolean = true
) => {
  const current = await getBadWords(serverId);
  if (addOrDelete) {
    const union = current.concat(words);
    const withoutDuplicate = union.filter((item, index) => union.indexOf(item) === index);
    await vars.set(serverId, keyBadWords, withoutDuplicate.join(' '));
  } else {
    const different = current.filter(item => !words.includes(item));
    if (!different.length) await vars.remove(serverId, keyBadWords);
    else await vars.set(serverId, keyBadWords, different.join(' '));
  }
};

// РАЗРЕШЕННЫЕ ПЛОХИЕ КАНАЛЫ

const keyBadChannels = 'warning_badchannels_ids';

export const getBadChannelsIds = async (
  serverId: string
): Promise<string[]> => (await vars.get(serverId, keyBadChannels))?.split(' ') || [];

export const setBadChannelsIds = async (
  serverId: string,
  channelIds: string[],
  addOrDelete: boolean = true
) => {
  const current = await getBadChannelsIds(serverId);
  if (addOrDelete) {
    const union = current.concat(channelIds);
    const withoutDuplicate = union.filter((item, index) => union.indexOf(item) === index);
    await vars.set(serverId, keyBadChannels, withoutDuplicate.join(' '));
  } else {
    const different = current.filter(item => !channelIds.includes(item));
    if (!different.length) await vars.remove(serverId, keyBadChannels);
    else await vars.set(serverId, keyBadChannels, different.join(' '));
  }
};
