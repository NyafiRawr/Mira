import { Message } from 'discord.js';

import { help } from './Предупреждения/help';
import { list } from './Предупреждения/list';
import { set } from './Предупреждения/set';
import { give } from './Предупреждения/give';
import { unset } from './Предупреждения/unset';
import { remove } from './Предупреждения/remove';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Система предупреждений',
  permissions: ['MANAGE_MESSAGES', 'ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    switch (args.shift()) {
      case 'list': {
        return list(message);
      }
      case 'give': {
        if (!message.member?.hasPermission(this.permissions[0])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[0]}`
          );
        }
        return give(message, args);
      }
      case 'set': {
        if (!message.member?.hasPermission(this.permissions[1])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[1]}`
          );
        }
        return set(message, args);
      }
      case 'unset': {
        if (!message.member?.hasPermission(this.permissions[1])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[1]}`
          );
        }
        return unset(message, args);
      }
      case 'remove': {
        if (!message.member?.hasPermission(this.permissions[1])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[1]}`
          );
        }
        return remove(message, args);
      }
      default: {
        return help(message);
      }
    }
  },
};
