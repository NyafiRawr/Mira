import { Message } from 'discord.js';
import * as punches from '../../../modules/mutes';
import { help } from './help';

export const removewords = async (message: Message, args: string[]) => {
  const removeWords = args.join();
  if (removeWords === undefined || removeWords.trim().length === 0) {
    throw new Error('не указаны слова для удаления.');
  }

  await punches.removeBadWords(message.guild!.id, removeWords.split(', '));

  await help(message);
};
