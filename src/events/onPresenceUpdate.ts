import { GuildMember } from 'discord.js';
import * as streams from '../modules/streams';

const onAir = new Map();

// Если юзер начал стрим проверяем настройки стрима на сервере и поднимаем вверх, перестал - отпускаем
export default async (oldMember: GuildMember, newMember: GuildMember) => {
  const stream = await streams.get(newMember.guild.id);

  if (!stream || !stream.state || !stream.roleId || !stream.games) return;

  const newUserPresenceGame = newMember?.presence?.game;
  const key = `${newMember.guild.id}_${newMember.id}`;

  const role = newMember.guild.roles.get(stream.roleId);
  if (!role) {
    return streams.set(newMember.guild.id, { roleId: null });
  }

  if (role.position >= newMember.guild.me.highestRole.position) return;

  if (!onAir.has(key) && newUserPresenceGame?.type === 1 && stream.games.includes(newUserPresenceGame?.state)) {
    newMember.addRole(stream.roleId);
    onAir.set(key, newMember.id);
  } else if (onAir.has(key) && (newUserPresenceGame?.type !== 1 || !stream.games.includes(newUserPresenceGame?.state))) {
    newMember.removeRole(stream.roleId);
    onAir.delete(key);
  }
};
