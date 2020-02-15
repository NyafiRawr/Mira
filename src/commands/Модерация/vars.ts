import * as Discord from 'discord.js';
import * as vars from '../../modules/vars';
import * as tools from '../../utils/tools';
import CustomError from '../../utils/customError';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Установить переменную',
  aliases: [],
  usage: '[all/set/remove] <name> <value>',
  guild: true,
  hide: false,
  cooldown: 1.5,
  cooldownMessage: undefined,
  permissions: [],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[] /* , CooldownReset */) {
    if (args[0] === 'set') {
      if (args.length < 3) { throw new CustomError('Не хватает параметров, пример команды: !vars set TEMP_CHANNELS_CATEGORY_ID 234976234818237'); }

      const newVar = await vars.set(message.guild.id, args[1], args.slice(2).join(' '));

      await message.reply(`Переменная ${newVar.name} успешно установлена.`);
    } else if (args[0] === 'remove') {
      if (args.length < 2) { throw new CustomError('Не хватает параметров, пример команды: !vars set TEMP_CHANNELS_CATEGORY_ID 234976234818237'); }

      await vars.remove(message.guild.id, args[1]);
      await message.reply(`Переменная ${args[1]} удалена.`);
    } else if (args[0] === 'all') {
      const embed = new Discord.RichEmbed();
      embed.setAuthor(
        `Переменные бота для сервера ${message.guild.name}`,
        message.guild.iconURL,
      );

      const all = await vars.getAll(message.guild.id);

      for (const varible of all) {
        embed.addField(varible.name, varible.value, false);
      }

      embed.setColor(tools.randomHexColor());

      embed.setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );
      message.channel.send({ embed });
    }
  },
};
