import { Message } from 'discord.js';
import config from '../../../config';
import { separateThousandth } from '../../../utils';
import * as lots from '../../../modules/lots';
import * as economy from '../../../modules/economy';
import { info } from './info';
import { check } from './check';
import Lottery from '../../../models/Lottery';

export const create = async (message: Message, args: string[]) => {
  const oldLot = await lots.get(message.guild!.id);
  if (oldLot !== null) {
    throw new Error(`какая-то лотерея уже проводится, нельзя начать новую.`);
  }

  const bet = parseInt(args[0], 10);
  if (Number.isInteger(bet) === false) {
    throw new Error(
      'не указана сумма розыгрыша, она должна быть целочисленной и положительной.'
    );
  } else if (bet < config.games.lottery.betMin) {
    throw new Error(
      `минимальная сумма розыгрыша для лотереи: ${separateThousandth(
        config.games.lottery.betMin.toString()
      )}:cookie:`
    );
  }

  await economy.setBalance(message.guild!.id, message.author.id, -bet);

  const maxMembers = await lots.getMaxMembers(message.guild!.id);

  const membersLimitCount = parseInt(args[1], 10) || maxMembers;
  if (Number.isInteger(membersLimitCount)) {
    if (membersLimitCount < 2) {
      throw new Error('количество участников не может быть меньше двух.');
    } else if (membersLimitCount > maxMembers) {
      throw new Error(
        `количество участников не может быть больше ${
          maxMembers || config.games.lottery.maxMembers
        }.`
      );
    }
  }

  let memberIds = '';

  if (message.mentions.members?.size) {
    if (message.mentions.members.size > membersLimitCount) {
      throw new Error(
        'упомянутых участников больше, чем разрешено иметь в лотерее.'
      );
    }
    if (message.mentions.members.has(message.author.id)) {
      throw new Error(
        'среди упомянутых участников ты упомянул себя самого, так нельзя.'
      );
    }
    memberIds = message.mentions.members.map((gm) => gm.id).toString();
  }

  const newLot = await lots.set(
    message.guild!.id,
    message.author.id,
    bet,
    membersLimitCount,
    memberIds
  );

  const isComplete = await check(message, newLot);
  if (isComplete === false) {
    await info(message);
  }
};
