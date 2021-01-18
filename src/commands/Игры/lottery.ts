import { Collection, Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import { randomInteger } from '../../utils';
import * as economy from '../../modules/economy';
import { separateThousandth } from '../../utils';
import * as vars from '../../modules/vars';

const body = {
  color: config.games.lottery.color,
  author: {
    name: 'Лотерея',
  },
};

class Lot {
  serverId: string;
  authorId: string;
  prize = 100;
  membersMaxCount: number = config.games.lottery.maxMembers;
  members: string[] = [];
}
const lots = new Collection<string, Lot>();

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Розыгрыш :cookie:',
  usage:
    '[create <ставка> [кол-во участников] [@,@,...] ИЛИ join ИЛИ maxmembers <кол-во>]',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    const embed = new MessageEmbed(body);
    let lottery: Lot | undefined = lots.get(message.guild!.id);

    if (args.length === 0) {
      if (lottery === undefined) {
        embed.setTitle('Ничего не проводится');
      } else {
        embed
          .setTitle(`Розыгрыш: ${lottery.prize}:cookie:`)
          .setDescription(`Организатор: <@${lottery.authorId}>`)
          .setFooter(
            `Участники: ${lottery.members.length}/${lottery.membersMaxCount}`
          );
      }

      return message.channel.send(embed);
    }

    if (args[0] === 'maxmembers') {
      const maxMembers = parseInt(args[1], 10);
      if (Number.isInteger(maxMembers) === false) {
        throw new Error('нужно указать целочисленное и положительное число.');
      }

      await vars.set(
        message.guild!.id,
        'lottery_maxmembers',
        maxMembers.toString()
      );

      return message.reply(
        `теперь максимальное количество участников в лотерее: ${maxMembers}:person_frowning:`
      );
    }

    if (args[0] === 'close') {
      if (lottery === undefined) {
        throw new Error('лотерей нет - нечего закрывать.');
      }
      if (lottery.authorId !== message.author.id) {
        throw new Error('ты не организатор лотереи и не можешь её закрыть.');
      }
      lots.delete(message.guild!.id);
      await economy.setBalance(
        message.guild!.id,
        message.author.id,
        lottery.prize
      );
      return message.channel.send(
        `Лотерея от ${message.author} закрыта! ${lottery.members
          .map((id) => `<@${id}>`)
          .join(', ')}`
      );
    }

    if (args[0] === 'join') {
      if (lottery === undefined) {
        throw new Error(
          'на этом сервере не проводится лотерея к которой можно присоединиться.'
        );
      }
      if (lottery.authorId === message.author.id) {
        throw new Error('ты организатор лотереи и не можешь участвовать.');
      }
      if (lottery.members.includes(message.author.id)) {
        throw new Error('ты уже участвуешь в лотерее, выйти нельзя.');
      }

      lottery.members.push(message.author.id);
      await message.reply('ты присоединился к лотерее!');

      lots.set(message.guild!.id, lottery);
    } else if (args[0] === 'create') {
      if (lottery !== undefined) {
        throw new Error(
          `какая-то лотерея уже проводится, напиши \`${config.discord.prefix}${this.name}\`, чтобы узнать больше.`
        );
      }

      const bet = parseInt(args[1], 10);
      if (Number.isInteger(bet) === false) {
        throw new Error(
          'не указана ставка, она должно быть целочисленной и положительной.'
        );
      } else if (bet < config.games.lottery.betMin) {
        throw new Error(
          `минимальная ставка для лотереи: ${separateThousandth(
            config.games.lottery.betMin.toString()
          )}:cookie:`
        );
      }

      await economy.setBalance(message.guild!.id, message.author.id, bet);

      const varMaxMembers = (
        await vars.getOne(message.guild!.id, 'lottery_maxmembers')
      )?.value;
      const maxMembers = varMaxMembers
        ? parseInt(varMaxMembers, 10)
        : config.games.lottery.maxMembers;

      const membersLimitCount = parseInt(args[2], 10) || maxMembers;
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
        message.mentions.members.map((gm) => lottery!.members.push(gm.id));
      }

      lots.set(message.guild!.id, lottery);
    } else {
      throw new Error(
        `нет такой команды, напиши \`${config.discord.prefix}help ${this.name}\`, чтобы узнать возможные варианты.`
      );
    }

    if (lottery!.members.length === lottery!.membersMaxCount) {
      lots.delete(message.guild!.id);

      const winnerIndex = randomInteger(0, lottery!.membersMaxCount - 1);
      await economy.setBalance(
        message.guild!.id,
        lottery!.members[winnerIndex],
        lottery!.prize
      );

      return message.channel.send(
        `<@${lottery!.members[winnerIndex]}> победил в лотерее от <@${
          lottery!.authorId
        }>!`,
        embed
          .setTitle('Победитель определен!')
          .setDescription(
            `<@${lottery!.members[winnerIndex]}> получает ${separateThousandth(
              lottery!.prize.toString()
            )}:cookie:!`
          )
          .setImage(
            'https://media1.tenor.com/images/757adf1f06b3ffd328339b1b9401db44/tenor.gif'
          )
      );
    } else {
      return message.channel.send(
        `${message.author} начал лотерею с ${separateThousandth(
          lottery!.prize.toString()
        )}:cookie:!`
      );
    }
  },
};
