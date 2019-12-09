import Discord from 'discord.js';
import * as tools from '../../modules/tools';

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
  execute(message /* , args, CooldownReset */) {
    const embed = new Discord.RichEmbed()
      .setAuthor('Спасибо за интерес к разработке!')
      .setDescription(
        '[Яндекс.Доширак: 410014841265118](https://money.yandex.ru/to/410014841265118)'
        + '[Фрукт QIWI, на никнейм: NyafiRawr](https://qiwi.com/payment/form/99999)'
        + '[WebMoney WMR: R119858043867](https://www.webmoney.ru/rus/inout/topup.shtml#bank-card_method)'
        + '[PayPal: NyafiRawr](http://paypal.me/NyafiRawr)'
        + '\nПомимо монетки Вы можете поддержать меня словом: рассказывая об ошибках или о том, что понравилось'
      )
      .setColor('#6DC066');

    message.author.send({ embed }).catch(() => {
      embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);
      message.channel.send({ embed });
    });
  },
};
