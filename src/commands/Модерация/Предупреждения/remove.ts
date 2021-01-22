import { Message } from 'discord.js';
import { isInteger } from 'lodash';
import { list } from './list';
import * as punches from '../../../modules/mutes';

export const remove = async (message: Message, args: string[]) => {
  const argNum = args.shift();
  if (argNum === undefined) {
    throw new Error('не указан номер условия.');
  }
  const num = parseInt(argNum, 10);
  if (isInteger(num) === false) {
    throw new Error('номер должен быть целочисленным и положительным.');
  }

  const terms = await punches.getTerms(message.guild!.id);

  if (num < 1 || num > terms.length) {
    throw new Error('такого номера нет в списке условий.');
  }

  const term = terms.find((mwt, index) => index === num - 1)!;

  await punches.removeTerm(message.guild!.id, term.countWarnings, term.forDays);

  await list(message);
};
