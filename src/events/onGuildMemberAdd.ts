import { GuildMember } from 'discord.js';
import * as users from '../modules/users';

export default async (member: GuildMember) => {
  await users.set(member.guild.id, member.user.id, {
    firstEntry: Date.now(),
  });
};
