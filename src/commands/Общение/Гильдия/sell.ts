import { Message } from 'discord.js';
import * as gilds from '../../../modules/gilds';
import * as gildrelations from '../../../modules/gildrelations';
import { info } from './info';

export const sell = async (message: Message, args: string[]) => {
  const relation = await gildrelations.getOne(
    message.guild!.id,
    message.author.id
  );
  if (relation == null) {
    throw new Error('у тебя нет гильдии, чтобы продавать её каналы.');
  }
  const gild = await gilds.getOne(relation.gildId);
  if (gild?.ownerId != message.author.id) {
    throw new Error('продавать каналы гильдии может только гильдмастер!');
  }

  const channelId = args.shift();
  if (channelId == undefined) {
    throw new Error('нужно указать ID канала.');
  }

  let channels: { texts: string[]; voices: string[] } = {
    texts: [],
    voices: [],
  };
  if (gild.channels != null) {
    channels = JSON.parse(gild.channels);
  }

  let price;
  if (channels.texts.includes(channelId)) {
    price = await gilds.priceBuyChannelText(message.guild!.id);
    channels.texts = channels.texts.filter((id) => id != channelId);
  } else if (channels.voices.includes(channelId)) {
    price = await gilds.priceBuyChannelVoice(message.guild!.id);
    channels.voices = channels.voices.filter((id) => id != channelId);
  } else {
    throw new Error('канала с таким ID нет в распоряжении гильдии.');
  }

  if (channels.texts.length == 0 && channels.voices.length == 0) {
    await gild.update({
      balance: gild.balance + price,
      channels: null,
    });
  } else {
    await gild.update({
      balance: gild.balance + price,
      channels: JSON.stringify(channels),
    });
  }

  const channel = message.guild!.channels.resolve(channelId);
  if (channel == null) {
    message.reply(
      'похоже, что канала давно нет на сервере ..., но теперь он удален из карточки гильдии.'
    );
  } else {
    await channel.delete('Продажа канала');
  }

  await info(message, [gild.id.toString()]);
};
