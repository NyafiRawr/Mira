export const emojiNumbers = [
  '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
];

export const emojiComplete = '✅';
// todo: ошибка по концу таймера
// todo: добавить кнопку отмены?
export const waitReaction = async (embed, reactions, selectorId) => {
  await embed.clearReactions();

  // eslint-disable-next-line no-restricted-syntax
  for await (const emoji of reactions) {
    // eslint-disable-next-line no-await-in-loop
    await embed.react(emoji);
  }

  const filter = (reaction, user) =>
    reactions.includes(reaction.emoji.name) && user.id === selectorId;

  return embed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    .then((collected) => reactions.indexOf(collected.first().emoji.name).toString())
    .catch(() => null);
};

export const waitReactionComplete = async (embed, reactions, reactionComplete, selectorId) => {
  await embed.clearReactions();

  // eslint-disable-next-line no-restricted-syntax
  for await (const emoji of reactions) {
    // eslint-disable-next-line no-await-in-loop
    await embed.react(emoji);
  }
  await embed.react(reactionComplete);

  const filter = (reaction, user) =>
    reactionComplete === reaction.emoji.name && user.id === selectorId;

  await embed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    .catch(() => null);

  return (embed.reactions.filter((reaction) =>
    reactions.includes(reaction.emoji.name)
    && reaction.users.some((user) => user.id === selectorId)))
    .map((reaction) => reactions.indexOf(reaction.emoji.name).toString());
};

export const waitMessage = async (channel, selectorId) => {
  const filter = (message) => message.author.id === selectorId;

  return channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
    .then((collected) => collected.first().content)
    .catch(() => null);
};
