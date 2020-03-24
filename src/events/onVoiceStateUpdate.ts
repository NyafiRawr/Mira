import { GuildMember } from 'discord.js';
import * as users from '../modules/users';

const inVoice = new Map();

// Если юзер зашёл в войс фиксируем дату входа, если вышел вычисляем время в войсе и записываем в базу
export default async (oldMember: GuildMember, newMember: GuildMember) => {
  const newUserChannel = newMember.voiceChannel;

  if (!inVoice.has(`${newMember.guild.id}_${newMember.id}`) && newUserChannel !== undefined) {
    inVoice.set(`${newMember.guild.id}_${newMember.id}`, Date.now());
  } else if (newUserChannel === undefined && inVoice.has(`${newMember.guild.id}_${newMember.id}`)) {
    const seconds = (Date.now() - inVoice.get(`${newMember.guild.id}_${newMember.id}`)) / 1000;
    inVoice.delete(`${newMember.guild.id}_${newMember.id}`);
    const user = await users.get(newMember.guild.id, newMember.id);
    const time = user?.voiceTime || 0;
    await users.set(newMember.guild.id, newMember.id, {
      voiceTime: time + seconds,
    });
  }
};
