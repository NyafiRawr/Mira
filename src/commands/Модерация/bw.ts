import { Message } from 'discord.js';

import { help } from './Фильтр слов/help';
import { addchannels } from './Фильтр слов/addchannels';
import { addwords } from './Фильтр слов/addwords';
import { removechannels } from './Фильтр слов/removechannels';
import { removewords } from './Фильтр слов/removewords';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Фильтр плохих слов',
  usage:
    '[add/rem <список через пробел>] [allow/deny <#каналы где разрешены слова>]',
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    switch (args.shift()) {
      case 'ac': {
        if (!message.member?.hasPermission(this.permissions[0])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[0]}`
          );
        }
        return await addchannels(message);
      }
      case 'aw': {
        if (!message.member?.hasPermission(this.permissions[0])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[0]}`
          );
        }
        return await addwords(message, args);
      }
      case 'rc': {
        if (!message.member?.hasPermission(this.permissions[0])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[0]}`
          );
        }
        return await removechannels(message);
      }
      case 'rw': {
        if (!message.member?.hasPermission(this.permissions[0])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[0]}`
          );
        }
        return await removewords(message, args);
      }
      default: {
        return await help(message);
      }
    }
  },
};
