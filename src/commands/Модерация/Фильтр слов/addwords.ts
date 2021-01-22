import { Message } from 'discord.js';
import * as punches from '../../../modules/mutes';
import { help } from './help';

export const addwords = async (message: Message, args: string[]) => {
  const newWords = args.join(' ').split(', ');
  if (newWords.length === 0) {
    throw new Error('не указаны новые слова.');
  }

  await punches.addBadWords(message.guild!.id, newWords);

  await help(message);
};
