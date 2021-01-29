import { Message, MessageEmbed } from 'discord.js';
import config from '../../../config';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';
import { separateThousandth } from '../../../utils';

const body = {
  color: config.colors.message,
  author: {
    name: 'Гильдия',
  },
};

export const info = async (message: Message, args: string[]) => {
  let gild;

  const gildId = args.shift();
  if (gildId != undefined) {
    const id = parseInt(gildId, 10);
    if (Number.isInteger(id) == false) {
      throw new Error('ID гильдии должен быть целым числом.');
    }
    gild = await gilds.getOne(id);
    if (gild == null) {
      throw new Error(`гильдия с ID: ${id} не найдена.`);
    }
  } else {
    const relation = await gildrelations.getOne(
      message.guild!.id,
      message.author.id
    );
    if (relation == null) {
      throw new Error('ты не принадлежишь никакой гильдии.');
    }
    gild = await gilds.getOne(relation.gildId);
    if (gild == null) {
      throw new Error(
        `ты принадлежишь гильдии ID: ${relation.gildId}, но её не существует, сообщи об этом разработчику.`
      );
    }
  }

  const owner = await message.guild!.members.fetch(gild.ownerId);

  const embed = new MessageEmbed(body)
    .setTitle(gild.name)
    .setThumbnail(owner.user.avatarURL({ dynamic: true }) || '')
    .setDescription(gild.description || '')
    .setImage(gild.imageURL || '')
    .setFooter(
      `Гильдмастер: ${owner.displayName} | В хранилище: ${separateThousandth(
        gild.balance.toString()
      )} печенек`
    );

  if (gild.channels != null) {
    const channels = JSON.parse(gild.channels);
    embed.addField(
      'Каналы',
      `Текстовые: ${
        channels.texts
          .map((channelId: string) => `<#${channelId}>`)
          .join(', ') || 'Нет'
      }` +
        `\nГолосовые: ${
          channels.voices
            .map((channelId: string) => `<#${channelId}>`)
            .join(', ') || 'Нет'
        }`,
      false
    );
  }

  const members = await gildrelations.getAll(message.guild!.id, gild.id);
  embed.addField(
    `Участники (${members.length})`,
    members.map((r) => `<@${r.userId}>`).join(', '),
    false
  );

  message.channel.send(embed);
};
