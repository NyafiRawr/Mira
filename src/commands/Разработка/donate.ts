import { Message } from 'discord.js';
import config from '../../config';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Поддержать автора',
  aliases: ['donut'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Message) {
    message.channel.send({
      embed: {
        color: config.colors.donate,
        description:
          '❤️ В качестве благодарности за поддержку: 1 рубль = 69:cookie:\n' +
          '*На все сервера, где есть я, даже, если тебя там нет!*',
        fields: [
          {
            name: 'ЯД/Юmoney',
            value:
              '[410014841265118](https://money.yandex.ru/to/410014841265118)',
            inline: true,
          },
          {
            name: 'WebMoney',
            value:
              '[WMR: R119858043867](https://www.webmoney.ru/rus/inout/topup.shtml#bank-card_method)',
            inline: true,
          },
          {
            name: 'Ник на QIWI',
            value: '[NYAFIRAWR](https://qiwi.com/payment/form/99999)',
            inline: true,
          },
          {
            name: 'PayPal',
            value: '[Nyafiru](https://www.paypal.me/nyafiru)',
            inline: true,
          },
          {
            name: '-',
            value: '-',
            inline: true,
          },
          {
            name: '-',
            value: '-',
            inline: true,
          },
        ],
        image: {
          url:
            'http://img.nga.178.com/attachments/mon_201911/01/-64xyuQ5-a59uXsZ7pT3cShs-a0.gif',
        },
        footer: {
          text:
            '«Возможности не приходят сами — вы создаете их» © Крис Гроссер',
        },
      },
    });
  },
};
