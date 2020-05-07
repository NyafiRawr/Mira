import { GuildMember } from 'discord.js';
import * as users from '../modules/users';
import Mute from '../models/mute';
import * as mutes from '../modules/mutes';

export default async (member: GuildMember) => {
  const haveUser = await users.get(member.guild.id, member.user.id);
  if (!haveUser)
    await users.set(member.guild.id, member.user.id, {
      firstEntry: Date.now(),
    });
  else { // Если вышел с сервера с мутом, возвращаем блокировочную роль
    const haveMute = await Mute.findOne({ where: { serverId: member.guild.id, userId: member.user.id } });
    if (!!haveMute) {
      await member.send('Хорошая попытка перезайти, но ты всё ещё заблокирован.').catch();
      const roleMuteId = await mutes.getRoleMute(member.guild.id);
      if (!!roleMuteId)
        await member.addRole(roleMuteId);
    }
  }
};
