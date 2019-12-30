import * as emotes from '../modules/emotes';


export default async (reaction, user) => {
  // Отличаем дефолтное или серверное эмодзи
  // eslint-disable-next-line no-underscore-dangle
  const emoteName = reaction._emoji.id != null ? reaction._emoji.id : reaction._emoji.name;
  // смотрим в бд
  const emoteDB = await emotes.get(reaction.message.channel.id, reaction.message.id, emoteName);

  if (!emoteDB) return;

  const customer = await reaction.message.guild.fetchMember(user.id); // ищем мембера
  if (customer) customer.addRole(emoteDB.roleId); // накидываем роль
};
