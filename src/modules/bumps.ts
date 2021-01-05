import { Message } from 'discord.js';
import Bump from '../models/Bump';
import * as economy from './economy';

export const getOne = async (
  serverId: string,
  botId: string
): Promise<Bump | null> =>
  Bump.findOne({
    where: { serverId, botId },
  });

export const getAll = async (serverId: string): Promise<Bump[]> =>
  Bump.findAll({
    where: {
      serverId,
    },
  });

export const add = async (
  serverId: string,
  botId: string,
  award: number,
  sentence: string
): Promise<Bump> => {
  const bot = await getOne(serverId, botId);

  if (bot == undefined) {
    return Bump.create({
      serverId,
      botId,
      award,
      sentence,
    });
  }

  return bot.update({
    award,
    sentence,
  });
};

export const remove = async (
  serverId: string,
  botId: string
): Promise<void> => {
  const bot = await getOne(serverId, botId);
  if (bot) {
    return bot.destroy();
  }
};

export const awardOfBump = async (message: Message): Promise<void> => {
  // Игнорируем ботов и ЛС
  if (message.author.bot || !message.guild) {
    return;
  }

  const bot = await getOne(message.guild!.id, message.author.id);
  if (bot == undefined) {
    return;
  }

  let content = null;

  if (message.content.includes(bot.sentence)) {
    content = message.content;
  } else if (message.embeds.length) {
    const description = message.embeds[0].description;
    if (description?.includes(bot.sentence)) {
      content = description;
    }
  }

  if (content) {
    const startMention = content.indexOf('<@');
    if (startMention == -1) {
      return;
    }
    const endMention = content.indexOf('>', startMention);
    const mentionId = content.slice(startMention + 2, endMention);

    await economy.setBalance(message.guild!.id, mentionId, bot.award);

    message.channel.send(
      `<@${mentionId}>, получена награда за бамп ${bot.award}:cookie:`
    );
  }
};