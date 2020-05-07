import Mute from '../models/mute';
import * as vars from '../modules/vars';

// БЛОКИРОВОЧНАЯ РОЛЬ

const keyRoleMute = `mute_role`;

export const getRoleMute = async (
  serverId: string
): Promise<string | undefined> => vars.get(serverId, keyRoleMute);

export const setRoleMute = async (
  serverId: string,
  roleId: string
) => vars.set(serverId, keyRoleMute, roleId);

// ВЫДАЧА МУТА

import * as Discord from 'discord.js';
import { convertSecondsToTime } from '../utils/tools';

export const msg = (
  victim: Discord.GuildMember,
  ms: number,
  reason: string
) => ({
  'embed': {
    'author': {
      'name': `${victim.user.username + '#' + victim.user.discriminator} получает блокировку`,
      'icon_url': victim.user.avatarURL
    },
    'description': `**Срок:** ${convertSecondsToTime(ms / 1000)}` +
    `**Причина:** ${reason}`,
  }
});

import CustomError from '../utils/customError';
import { client } from '../client';

export const punch = async (
  serverId: string,
  victimId: string,
  ms: number,
  reason: string | undefined = 'Не указана'
) => {
  const roleMuteId = await getRoleMute(serverId);
  if (!roleMuteId) {
    throw new CustomError('не установлена блокировочная роль.');
  } else {
    const server = client.guilds.get(serverId);
    const victim = server!.members.get(victimId);
    if (!victim) {
      throw new CustomError('пользователь не найден.');
    } else {
      await victim.addRole(roleMuteId).catch(() => {
        throw new CustomError('не удалось выдать блокировочную роль.');
      });

      await Mute.create({
        serverId,
        userId: victimId,
        dateRelease: Date.now() + ms,
        reason
      });

      await victim.send(
        `Ты получил блокировку на сервере **${server!.name}** на срок **${convertSecondsToTime(ms / 1000)}**`
      ).catch();
    }
  }
};
