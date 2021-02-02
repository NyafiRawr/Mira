import { Message } from 'discord.js';
import config from '../../../config';

export const help = async (message: Message) => {
  await message.channel.send({
    embed: {
      color: config.games.lottery.color,
      author: {
        name: 'Модуль osu!',
      },
      description:
        ' - Этот модуль межсерверный, где бы ты не вызвал его, он будет отображать одни и те же привязанные профили' +
        '\n - Если тебя забанят в игре, то ты будешь видеть сохраненную информацию о тебе' +
        '\n - Поддерживаемые сервера: Osu.ppy.sh, Gatari.pw, Akatsuki.pw, Ripple.moe.',
      fields: [
        {
          name: 'Команды',
          value:
            `\`${config.discord.prefix}osu link <ссылка на профиль>\` - Привязать профиль` +
            `\n\`${config.discord.prefix}osu p\` - Мой профиль` +
            `\n\`${config.discord.prefix}osu list\` - Список моих профилей` +
            `\n\`${config.discord.prefix}osu recent\` - Последний результат` +
            `\n\`${config.discord.prefix}osu score <ID карты>\` - Мой лучший результат на карте` +
            `\n\`${config.discord.prefix}osu topscores [кол-во]\` - Мои лучшие результаты [до 100]`,
          inline: false,
        },
        {
          name: 'Игры',
          value:
            `\`${config.discord.prefix}osu battle <@>\` - Сразиться с упомянутым в прохождении карты` +
            `\n\`${config.discord.prefix}osu improve\` - Пройти карту и получить :cookie:`,
          inline: false,
        },
        {
          name: 'Настройка',
          value: `\`${config.discord.prefix}osu autorole <on/off>\` - автовыдача ролей со сложностью`,
          inline: false,
        },
      ],
      footer: {
        text: 'Параметры обёрнутые в <> - обязательны, а в [] - нет',
      },
    },
  });
};
