import { Message } from 'discord.js';
import { isInteger } from 'lodash';
import { help } from './help';
import * as punches from '../../../modules/mutes';

export const set = async (message: Message, args: string[]) => {
  const argWarnings = args.shift();
  if (argWarnings === undefined) {
    throw new Error('не указано количество варнов.');
  }
  const countWarnings = parseInt(argWarnings, 10);
  if (isInteger(countWarnings) === false) {
    throw new Error(
      'количество предупреждений должно быть целочисленным и положительным.'
    );
  } else if (countWarnings === 0 || countWarnings > 50) {
    throw new Error(
      'количество предупреждений должно быть в пределах от 1 до 50.'
    );
  }

  const argDays = args.shift();
  if (argDays === undefined) {
    throw new Error('не указано количество варнов.');
  }
  const forDays = parseInt(argDays, 10);
  if (isInteger(forDays) === false) {
    throw new Error(
      'количество дней должно быть целочисленным и положительным.'
    );
  } else if (forDays === 0 || forDays > 30) {
    throw new Error('количество дней должно быть в пределах от 1 до 30.');
  }

  const argTime = args.shift();
  if (argTime === undefined) {
    throw new Error('не указан срок.');
  }
  const minutes = parseInt(argTime, 10);
  if (isInteger(minutes) === false) {
    throw new Error('минуты должны быть целочисленными и положительными.');
  } else if (minutes < punches.minutesCheckReleases) {
    throw new Error(
      `срок не должен быть меньше ${punches.minutesCheckReleases} мин.`
    );
  }
  const timestamp = minutes * 60 * 1000;

  await punches.setTerm(message.guild!.id, countWarnings, forDays, timestamp);

  await help(message);
};
