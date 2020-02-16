import { GuildMember, MessageReaction } from 'discord.js';

import * as emotes from '../utils/emotes';

export default async (reaction: MessageReaction, user: GuildMember) => {
  // Отличаем дефолтное или серверное эмодзи
  // eslint-disable-next-line no-underscore-dangle
  const emoteName =
    reaction.emoji.id != null ? reaction.emoji.id : reaction.emoji.name;
  // смотрим в бд
  const emoteDB = await emotes.get(
    reaction.message.channel.id,
    reaction.message.id,
    emoteName
  );

  if (emoteDB === null) {
    return;
  }

  const customer = await reaction.message.guild.fetchMember(user.id); // ищем мембера
  if (customer) {
    customer.addRole(emoteDB.roleId);
  } // накидываем роль
};
