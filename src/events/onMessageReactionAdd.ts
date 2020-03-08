import { GuildMember, MessageReaction } from 'discord.js';
import * as ReactionRoles from '../modules/reactionroles';
// Отличаем дефолтное или серверное эмодзи и проверяем наличие в базе
export default async (reaction: MessageReaction, user: GuildMember) => {
  const emoji =
    reaction.emoji.id != null ? reaction.emoji.id : reaction.emoji.name;

  const response = await ReactionRoles.get(
    reaction.message.guild.id,
    reaction.message.channel.id,
    reaction.message.id,
    emoji
  );

  if (response !== null) {
    const member = await reaction.message.guild.fetchMember(user.id);
    if (member) {
      member.addRole(response.roleId);
    }
  }
};
