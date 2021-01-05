import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Поддержать автора',
  aliases: ['donut'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Message) {
    message.channel.send(
      new MessageEmbed()
        .setColor(config.colors.donate)
        .setDescription(
          '❤️ В качестве благодарности за поддержку: 1 рубль = 69:cookie:\n' +
            '*На все сервера, где есть я, даже, если тебя там нет!*'
        )
        .addField(
          'ЯД/Юmoney',
          '[410014841265118](https://money.yandex.ru/to/410014841265118)',
          true
        )
        .addField(
          'QIWI',
          '[Копилка](https://qiwi.me/81e51b22-d3bf-4ec4-b72f-5d4f537abc1b)',
          true
        )
        .addField(
          'WebMoney',
          '[WMR: R119858043867](https://www.webmoney.ru/rus/inout/topup.shtml#bank-card_method)',
          true
        )
        .setImage(
          'http://img.nga.178.com/attachments/mon_201911/01/-64xyuQ5-a59uXsZ7pT3cShs-a0.gif'
        )
        .setFooter(
          '«Возможности не приходят сами — вы создаете их» © Крис Гроссер'
        )
    );
  },
};
