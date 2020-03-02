import * as emojiCharacters from './emojiCharacters';
import * as Discord from 'discord.js';
import CustomError from './customError';

const clearFail = (error: string) => {
  throw new CustomError(`ошибка очистки реакций: \`${error}\``);
};

// Ждать одной реакции из указанного массива в указанном embed-сообщении и вернуть её (30 сек, иначе undefined. Отмена - null)
export const waitReaction = async (
  embed: Discord.Message,
  reactions: string[],
  selectorId: string
) => {
  await embed.clearReactions().catch(error => clearFail(error));

  for await (const emoji of reactions) {
    await embed.react(emoji);
  }
  await embed.react(emojiCharacters.words.cancel);

  const rects = reactions.concat(emojiCharacters.words.cancel);
  const filter = (reaction: Discord.MessageReaction, user: Discord.User) =>
    user.id === selectorId && rects.includes(reaction.emoji.name);

  const answer = await embed
    .awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    .then(collected => rects.indexOf(collected.first().emoji.name).toString())
    .catch(() => undefined);

  await embed.clearReactions().catch(error => clearFail(error));

  if ((answer ? rects[parseInt(answer, 10)] : null) === emojiCharacters.words.cancel) {
    return undefined;
  }
  return answer;
};
// Ждать реакции завершения в указанном embed-сообщении и вернуть массив выбранных реакций (30 сек, иначе undefined. Отмена - null)
export const waitReactionComplete = async (
  embed: Discord.Message,
  reactions: string[],
  selectorId: string
) => {
  await embed.clearReactions().catch(error => clearFail(error));

  for await (const emoji of reactions) {
    await embed.react(emoji);
  }
  await embed.react(emojiCharacters.words.complete);
  await embed.react(emojiCharacters.words.cancel);

  const filter = (reaction: Discord.MessageReaction, user: Discord.User) =>
    emojiCharacters.words.complete === reaction.emoji.name && user.id === selectorId;

  await embed
    .awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    .catch(() => undefined);

  return embed.reactions
    .filter(
      reaction =>
        reactions.includes(reaction.emoji.name) &&
        reaction.users.some(user => user.id === selectorId)
    )
    .map(reaction => reactions.indexOf(reaction.emoji.name).toString());

  await embed.clearReactions().catch(error => clearFail(error));
};
// Ждать сообщения в указанном канале от указанного человека и вернуть ответ (30 сек, иначе undefined. Ответ удаляется. Отмены нет)
export const waitMessage = async (channel: any, selectorId: string) => {
  const filter = (message: Discord.Message) => message.author.id === selectorId;

  return channel
    .awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
    .then((collected: any) => {
      channel.fetchMessage(collected.first()).then((answer: { delete: () => any; }) => answer.delete());
      return collected.first().content;
    })
    .catch(() => undefined);
};
