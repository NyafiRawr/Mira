import * as emotes from '../modules/emotes';


export default async (reaction, user) => {
  // eslint-disable-next-line no-underscore-dangle
  const emoteName = reaction._emoji.id != null ? reaction._emoji.id : reaction._emoji.name;
  const emoteDB = await emotes.get(reaction.message.channel.id, reaction.message.id, emoteName);

  if (!emoteDB) return;

  const customer = await reaction.message.guild.fetchMember(user.id);
  if (customer) customer.removeRole(emoteDB.roleId);
};
