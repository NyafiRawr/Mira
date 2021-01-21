import { Message } from 'discord.js';
import * as punches from '../../../modules/mutes';
import { help } from './help';

export const addchannels = async (message: Message) => {
  if (message.mentions.channels.size === 0) {
    throw new Error('не упомянут ни один канал.');
  }

  await punches.addBadChannels(
    message.guild!.id,
    message.mentions.channels.map((channel) => channel.id)
  );

  await help(message);
};
