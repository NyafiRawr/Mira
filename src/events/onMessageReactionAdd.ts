import { GuildMember, MessageReaction } from 'discord.js';
import * as emotes from '../utils/emojis';
// Отличаем дефолтное или серверное эмодзи и проверяем наличие в базе
export default async (reaction: MessageReaction, user: GuildMember) => {
  const emoteName =
    reaction.emoji.id != null ? reaction.emoji.id : reaction.emoji.name;

  const emoteDB = await emotes.get(
    reaction.message.channel.id,
    reaction.message.id,
    emoteName
  );

  if (emoteDB === null) {
    return;
  }

  const customer = await reaction.message.guild.fetchMember(user.id);
  if (customer) {
    customer.addRole(emoteDB.roleId);
  }
};
