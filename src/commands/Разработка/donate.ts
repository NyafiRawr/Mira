import * as Discord from 'discord.js';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Поддержать разработчика',
  aliases: ['donut'],
  usage: undefined,
  guild: false,
  hide: true,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Discord.Message) {
    const embed = new Discord.RichEmbed()
      .setAuthor('Спасибо за поддержку!')
      .setDescription(
        '[Яндекс.Доширак: 410014841265118](https://money.yandex.ru/to/410014841265118)' +
          '\n[QIWI Копилка](https://qiwi.me/81e51b22-d3bf-4ec4-b72f-5d4f537abc1b)' +
          '\n[WebMoney WMR: R119858043867](https://www.webmoney.ru/rus/inout/topup.shtml#bank-card_method)' +
          '\n[PayPal: NyafiRawr](http://paypal.me/NyafiRawr)' +
          '\n\nНе забудь указать свой никнейм с сервера!'
      )
      .setColor('#6DC066')
      .setImage(
        'http://img.nga.178.com/attachments/mon_201911/01/-64xyuQ5-a59uXsZ7pT3cShs-a0.gif'
      );

    message.author.send({ embed }).catch(() => {
      embed.setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );
      message.channel.send({ embed });
    });
  },
};
