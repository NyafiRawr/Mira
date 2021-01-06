import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import * as users from '../../modules/users';
import User from '../../models/User';
import { separateThousandth } from '../../utils';

const topSize = 15;

const body = {
  color: config.colors.message,
  author: {
    name: 'Печеньковые богачи',
  },
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Печеньковые богачи',
  usage: '[номер страницы]',
  aliases: ['cootop', 'moneytop'],
  cooldown: {
    seconds: 30,
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    const base = await users.all(message.guild!.id);
    const onlyLiveHumans: User[] = [];
    for await (const user of base) {
      const member = await message
        .guild!.members.fetch(user.userId)
        .catch(() => null);
      if (member?.user?.bot === false && user.balance !== 0) {
        onlyLiveHumans.push(user);
      }
    }
    if (onlyLiveHumans.length == 0) {
      throw new Error(
        'в этом мире нет печенья... но я здесь и вместе мы сможем исправить это!'
      );
    }
    onlyLiveHumans.sort((a, b) => b.balance - a.balance);

    const maxTopSize =
      topSize > onlyLiveHumans.length ? onlyLiveHumans.length : topSize;
    const pages: User[][] = [];
    for (let i = 0; i < Math.ceil(onlyLiveHumans.length / maxTopSize); i++) {
      pages.push(
        onlyLiveHumans.slice(i * maxTopSize, i * maxTopSize + maxTopSize)
      );
    }

    let pageNumber = 0;
    if (args.length > 0) {
      pageNumber = parseInt(args[0], 10);
      if (Number.isInteger(pageNumber) == false) {
        throw new Error('некорректный номер страницы!');
      }
      if (pageNumber < 1 || pages.length > pageNumber) {
        throw new Error(`страницы ${pageNumber} нет.`);
      }
    } else {
      pageNumber = 1;
    }

    const embed = new MessageEmbed(body);
    message.channel.send(
      embed
        .setDescription(
          pages[pageNumber - 1]
            .map((user, index) => {
              return `**${maxTopSize * (pageNumber - 1) + index + 1}. <@${
                user.userId
              }>** ${separateThousandth(user.balance.toString())}:cookie:`;
            })
            .join('\n')
        )
        .setFooter(`Страница: ${pageNumber}/${pages.length}`)
    );
  },
};
