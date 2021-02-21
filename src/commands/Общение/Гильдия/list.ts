import { Message, MessageEmbed } from 'discord.js';
import config from '../../../config';
import Gild from '../../../models/Gild';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';

const topSize = 15;

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

  const page = new MessageEmbed(body);
  for await (const gild of pages[pageNumber - 1]) {
    const channels: { texts: string[]; voices: string[] } =
      gild.channels === null
        ? { texts: [], voices: [] }
        : JSON.parse(gild.channels);
    page.addField(
      `${gild.name}`,
      `🆔 ${gild.id} 🙎${await gildrelations.count(
        message.guild!.id,
        gild.id
      )} уч. 💬 ${channels.texts.length} чат. 🎙️${
        channels.voices.length
      } к.\nГильдмастер <@${gild.ownerId}>`
    );
  }

  await message.channel.send(
    page.setFooter(`Страница: ${pageNumber}/${pages.length}`)
  );
};
