import { GuildMember } from 'discord.js';
import * as vars from '../modules/vars';

const onAir = new Map();

// Если юзер начал стрим проверяем настройки стрима на сервере и поднимаем вверх, перестал - отпускаем
export default async (oldMember: GuildMember, newMember: GuildMember) => {
  const roleId = await vars.get(newMember.guild.id, 'stream_roleId');
  if (!roleId) return;
  const state = await vars.get(newMember.guild.id, 'stream_state');
  if (!state) return;
  const games = await vars.get(newMember.guild.id, 'stream_games');
  if (!games) return;

  const newUserPresenceGame = newMember?.presence?.game;
  const key = `${newMember.guild.id}_${newMember.id}`;

  const role = newMember.guild.roles.get(roleId);
  if (!role) {
    return vars.remove(newMember.guild.id, 'stream_roleId');
  }

  if (role.position >= newMember.guild.me.highestRole.position) return;

  if (!onAir.has(key) && newUserPresenceGame?.type === 1 && games.includes(newUserPresenceGame?.state)) {
    newMember.addRole(roleId);
    onAir.set(key, newMember.id);
  } else if (onAir.has(key) && (newUserPresenceGame?.type !== 1 || !games.includes(newUserPresenceGame?.state))) {
    newMember.removeRole(roleId);
    onAir.delete(key);
  }
};
