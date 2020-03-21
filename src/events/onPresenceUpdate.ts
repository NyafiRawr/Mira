import { GuildMember } from 'discord.js';
import * as streams from '../modules/streams';

const onAir = new Map(); // TODO: если обрыв связи, то стримеры застрянут в эфире до повторного выключения стрима

// Если юзер начал стрим проверяем настройки стрима на сервере и поднимаем вверх, перестал - отпускаем
export default async (oldMember: GuildMember, newMember: GuildMember) => {
  const stream = await streams.get(newMember.guild.id);

  if (!stream || !stream.state) return;

  const newUserPresenceGame = newMember?.presence?.game;
  const key = `${newMember.guild.id}_${newMember.id}`;

  if (!onAir.has(key) && newUserPresenceGame?.type === 1 && stream.games.includes(newUserPresenceGame?.name)) {
    newMember.addRole(stream.roleId);
    onAir.set(key, newMember.id);
  } else if (onAir.has(key) && (newUserPresenceGame?.type !== 1 || !stream.games.includes(newUserPresenceGame?.name))) {
    newMember.removeRole(stream.roleId);
    onAir.delete(key);
  }
};
