import { Message } from 'discord.js';
import config from '../../../config';
import * as punches from '../../../modules/mutes';

export const help = async (message: Message) => {
  const terms = await punches.getTerms(message.guild!.id);
  await message.channel.send({
    embed: {
      color: config.colors.message,
      author: {
        name: 'Система наказаний',
      },
      title: terms.length === 0 ? 'Отключена' : 'Включена',
      fields: [
        {
          name: 'Авто-выдача мута',
          value:
            terms
              .map(
                (term, index) =>
                  `${index + 1}. За ${
                    term.countWarnings
                  } предупреждения в течение ${term.forDays} дней изоляция на ${
                    term.timestamp / 60 / 1000
                  } мин.`
              )
              .join('\n') || 'Нет',
          inline: false,
        },
        {
          name: 'Команды',
          value:
            `\`${config.discord.prefix}warn set <кол-во warn> <в течение скольки дней> [срок в минутах]\` - добавить` +
            `\n\`${config.discord.prefix}warn remove <номер>\` - удалить настройку авто-мута` +
            `\n\`${config.discord.prefix}warn give <@кому> [почему]\` - сделать предупреждение` +
            `\n\`${config.discord.prefix}warn list [@]\` - история предупреждений`,
          inline: false,
        },
      ],
      footer: {
        text: `Обязательно должен быть настроен "${config.discord.prefix}mute"!`,
      },
    },
  });
};
