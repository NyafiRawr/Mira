import Warning from '../models/warning';
import * as Discord from 'discord.js';
import * as vars from '../modules/vars';

export const set = async (
  serverId: string,
  victimId: string,
  reason: string
) => Warning.create({
  serverId,
  userId: victimId,
  reason
});

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

// Bad words auto-mod
const keyBadWords = 'warning_badwords';

export const getBadWords = async (
  serverId: string
): Promise<string[]> => (await vars.get(serverId, keyBadWords))?.split(' ') || [];

export const editBadWords = async (
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

const keyBadChannels = 'warning_badchannels_ids';

export const getBadChannelsIds = async (
  serverId: string
): Promise<string[]> => (await vars.get(serverId, keyBadChannels))?.split(' ') || [];

export const editBadChannelsIds = async (
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
