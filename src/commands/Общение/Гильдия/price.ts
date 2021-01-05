import { Message } from 'discord.js';
import * as gilds from '../../../modules/gilds';

const permission = 'ADMINISTRATOR';

export const price = async (message: Message, args: string[]) => {
  if (!message.member!.hasPermission(permission)) {
    throw new Error(`нужно иметь глобальную привилегию: ${permission}.`);
  }

  const target = args.shift();

  const num = args.shift();
  if (num == undefined) {
    throw new Error('не указана новая цена.');
  }

  const newValue = parseInt(num, 10);
  if (Number.isInteger(newValue) == false || newValue < 1) {
    throw new Error(
      'ты неправильно указал количество, оно должно быть целочисленным и положительным.'
    );
  }

  switch (target) {
    case 'create': {
      const price = await gilds.priceCreate(message.guild!.id, newValue);
      message.reply(
        `установлена новая цена на создание гильдии: **${price}**:cookie:`
      );
      return;
    }
    case 'text': {
      const price = await gilds.priceBuyChannelText(
        message.guild!.id,
        newValue
      );
      message.reply(
        `установлена новая цена на покупку текстового канала гильдии: **${price}**:cookie:`
      );
      return;
    }
    case 'voice': {
      const price = await gilds.priceBuyChannelVoice(
        message.guild!.id,
        newValue
      );
      message.reply(
        `установлена новая цена на покупку голосового канала гильдии: **${price}**:cookie:`
      );
      return;
    }
    case 'desc': {
      const price = await gilds.priceEditDesc(message.guild!.id, newValue);
      message.reply(
        `установлена новая цена за редактирование описания гильдии: **${price}**:cookie:`
      );
      return;
    }
    case 'img': {
      const price = await gilds.priceEditImg(message.guild!.id, newValue);
      message.reply(
        `установлена новая цена за редактирование изображения гильдии: **${price}**:cookie:`
      );
      return;
    }
    default: {
      throw new Error(`\`${target}\` нет в списке для изменения цены.`);
    }
  }
};
