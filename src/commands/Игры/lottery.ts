import { Collection, Message } from 'discord.js';
import config from '../../config';

export class Lot {
  serverId: string;
  authorId: string;
  prize = config.games.lottery.betMin;
  membersMaxCount: number = config.games.lottery.maxMembers;
  members: string[] = [];
}
export const lots = new Collection<string, Lot>();

export const keyMaxMembers = 'lottery_maxmembers';

import { create } from './Лотерея/create';
import { close } from './Лотерея/close';
import { info } from './Лотерея/info';
import { join } from './Лотерея/join';
import { help } from './Лотерея/help';
import { maxmembers } from './Лотерея/maxmembers';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Розыгрыш :cookie:',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    switch (args.shift()) {
      case 'create': {
        await create(message, args);
        break;
      }
      case 'close': {
        await close(message);
        break;
      }
      case 'info': {
        await info(message);
        break;
      }
      case 'join': {
        await join(message);
        break;
      }
      case 'maxmembers': {
        await maxmembers(message, args);
        break;
      }
      default: {
        await help(message);
      }
    }
  },
};
