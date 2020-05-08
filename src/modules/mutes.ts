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

import { client } from '../client';

// РАЗМУТ КАЖДУЮ МИНУТУ

const checkMutes = async () => {
  const muteds = await Mute.findAll();
  for (const muted of muteds) {
    if (muted.dateRelease.getTime() <= Date.now()) {
      const server = client.guilds.get(muted.serverId);
      const victim = server?.members.get(muted.userId);
      if (!!victim) {
        const roleMuteId = await getRoleMute(muted.serverId);
        if (!!roleMuteId) {
          await victim.removeRole(roleMuteId)
          .then(() => {
            victim.send(`Ты разблокирован на сервере **${server}**.`);
          })
          .catch(() => {
            throw new CustomError('не удалось снять блокировочную роль.');
          });
        }
      }
      await muted.destroy();
    }
  }
  setTimeout(() => checkMutes(), 60 * 1000);
};
checkMutes();

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
      `\n**Причина:** ${reason}`,
  }
});

import CustomError from '../utils/customError';

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

      const haveMute = await Mute.findOne({ where: { serverId, userId: victimId } });
      if (!!haveMute) {
        await haveMute.update({
          dateRelease: Date.now() + ms,
          reason
        });
      } else {
        await Mute.create({
          serverId,
          userId: victimId,
          dateRelease: Date.now() + ms,
          reason
        });
      }
      await victim.send(
        `Ты получил блокировку на сервере **${server!.name}** на срок **${convertSecondsToTime(ms / 1000)}**`
      ).catch();
    }
  }
};
