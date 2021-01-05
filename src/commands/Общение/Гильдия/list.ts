import { Message, MessageEmbed } from 'discord.js';
import config from '../../../config';
import Gild from '../../../models/Gild';
import * as gilds from '../../../modules/gilds';
import { separateThousandth } from '../../../utils';

const topSize = 5;

const body = {
  color: config.colors.message,
  title: 'Список гильдий',
};

export const list = async (message: Message, args: string[]) => {
  const list = await gilds.getAll(message.guild!.id);

  if (list.length == 0) {
    throw new Error(
      'на этом сервере нет гильдий, но я здесь и вместе мы сможем это исправить!'
    );
  }

  list.sort((a, b) => b.balance - a.balance);

  const maxTopSize = topSize > list.length ? list.length : topSize;
  const pages: Gild[][] = [];
  for (let i = 0; i < Math.ceil(list.length / maxTopSize); i++) {
    pages.push(list.slice(i * maxTopSize, i * maxTopSize + maxTopSize));
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

  message.channel.send(
    new MessageEmbed(body)
      .setDescription(
        pages[pageNumber - 1]
          .map((gild) => {
            return `${gild.gildId}. **${gild.name}** | <@${
              gild.ownerId
            }> | ${separateThousandth(gild.balance.toString())}:cookie:`;
          })
          .join('\n')
      )
      .setFooter(`Страница: ${pageNumber}/${pages.length}`)
  );
};
