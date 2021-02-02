import { Message } from 'discord.js';

import { profile } from './osu!/profile';
import { help } from './osu!/help';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Модуль osu!',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    switch (args.shift()) {
      case 'p': {
        await profile(message, args);
        break;
      }
      default: {
        await help(message);
      }
    }
  },
};
