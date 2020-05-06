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
) => vars.get(serverId, keyBadWords);

export const editBadWords = async (
  serverId: string,
  words: string[],
  addOrDelete: boolean = true
) => {
  const current = await vars.get(serverId, keyBadWords);
  const newArray = current.split(', ');
  if (addOrDelete) newArray.concat(words);
  else words.filter((value) => !newArray.includes(value));
  await vars.set(serverId, keyBadWords, [new Set(newArray)].join(', '));
};
