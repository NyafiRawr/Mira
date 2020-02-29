import * as Discord from 'discord.js';

// TODO: ошибка по концу таймера
// TODO: добавить кнопку отмены
// TODO: добавить описание функций
export const waitReaction = async (
  embed: Discord.Message,
  reactions: string[],
  selectorId: string
) => {
  await embed.clearReactions();

  for await (const emoji of reactions) {
    await embed.react(emoji);
  }

  const filter = (reaction: Discord.MessageReaction, user: Discord.User) =>
    reactions.includes(reaction.emoji.name) && user.id === selectorId;

  return embed
    .awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    .then(collected =>
      reactions.indexOf(collected.first().emoji.name).toString()
    )
    .catch(() => null);
};

export const waitReactionComplete = async (
  embed: Discord.Message,
  reactions: string[],
  reactionComplete: string,
  selectorId: string
) => {
  await embed.clearReactions();

  for await (const emoji of reactions) {
    await embed.react(emoji);
  }
  await embed.react(reactionComplete);

  const filter = (reaction: Discord.MessageReaction, user: Discord.User) =>
    reactionComplete === reaction.emoji.name && user.id === selectorId;

  await embed
    .awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    .catch(() => null);

  return embed.reactions
    .filter(
      reaction =>
        reactions.includes(reaction.emoji.name) &&
        reaction.users.some(user => user.id === selectorId)
    )
    .map(reaction => reactions.indexOf(reaction.emoji.name).toString());
};

export const waitMessage = async (channel: any, selectorId: string) => {
  const filter = (message: Discord.Message) => message.author.id === selectorId;

  return channel
    .awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
    .then((collected: any) => {
      channel.fetchMessage(collected.first()).then((answer: { delete: () => any; }) => answer.delete());
      return collected.first().content;
    })
    .catch(() => null);
};
