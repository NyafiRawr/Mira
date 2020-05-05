import { GuildMember, MessageReaction } from 'discord.js';
import * as ReactionRoles from '../modules/reactionRoles';
import CustomError from '../utils/customError';
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
    const role = reaction.message.guild.roles.get(response.roleId);
    if (role!.position >= reaction.message.guild.me.highestRole.position) {
      throw new CustomError(
        'не могу снять роль, которая выше или равна моей наивысшей!'
      );
    }
    const member = await reaction.message.guild.fetchMember(user.id);
    if (member) {
      member.removeRole(response.roleId);
    }
  }
};
