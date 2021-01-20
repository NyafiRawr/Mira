import { Message } from 'discord.js';
import config from '../../../config';
import { separateThousandth } from '../../../utils';
import { lots, keyMaxMembers } from '../lot';
import * as economy from '../../../modules/economy';
import * as vars from '../../../modules/vars';
import { info } from './info';
import { check } from './check';

export const create = async (message: Message, args: string[]) => {
  let lottery = lots.get(message.guild!.id);
  if (lottery !== undefined) {
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

  const varMaxMembers = (await vars.getOne(message.guild!.id, keyMaxMembers))
    ?.value;
  const maxMembers = varMaxMembers
    ? parseInt(varMaxMembers, 10)
    : config.games.lottery.maxMembers;

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

  lottery = {
    serverId: message.guild!.id,
    authorId: message.author.id,
    prize: bet,
    membersMaxCount: membersLimitCount,
    members: [],
  };

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
    message.mentions.members.map((gm) => lottery!.members.push(gm.id));
  }

  lots.set(message.guild!.id, lottery);

  const isComplete = await check(message, lottery);
  if (isComplete === false) {
    await info(message);
  }
};
