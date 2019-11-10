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
      .setAuthor('Благодарю за интерес к разработке!')
      .setTitle('Помочь Яндекс.Деньгами')
      .setURL('https://money.yandex.ru/to/410014841265118')
      .setDescription('Помимо денег Вы можете поддержать меня словом: рассказывая об ошибках или о том, что понравилось o/')
      .setColor('#6DC066');

    message.author.send({ embed }).catch(() => {
      embed.setFooter(tools.myFooter(message, this.name), message.author.displayAvatarURL);
      message.channel.send({ embed });
    });
  },
};
