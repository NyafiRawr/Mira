import { GuildMember } from 'discord.js';
import * as users from '../modules/users';

const inVoice = new Map();

// Если юзер зашёл в войс фиксируем дату входа, если вышел вычисляем время в войсе и записываем в базу
export default async (oldMember: GuildMember, newMember: GuildMember) => {
  const oldUserChannel = oldMember.voiceChannel;
  const newUserChannel = newMember.voiceChannel;

  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    inVoice.set(`${newMember.guild.id}_${newMember.id}`, Date.now());
  } else if (newUserChannel === undefined) {
    const entryVoiceDate = inVoice.get(`${newMember.guild.id}_${newMember.id}`);
    if (!entryVoiceDate) {
      return;
    } else {
      inVoice.delete(`${newMember.guild.id}_${newMember.id}`);
    }
    const seconds = (Date.now() - entryVoiceDate) / 1000;
    const user = await users.get(oldMember.guild.id, oldMember.id);
    await users.set(oldMember.guild.id, oldMember.id, { voiceTime: user?.voiceTime || 0 + seconds });
  }
};
