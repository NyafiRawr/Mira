import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as economy from '../../modules/economy';
import * as guilds from '../../modules/guilds';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Гильдии (свой канал и голосовой чат)',
  aliases: ['g'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  permisions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed()
      .setAuthor(this.description, message.guild.iconURL)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    const price = 150000; // TODO: vars?

    if (args.length === 0) {
      embed
        .setDescription(
          `**${this.aliases[0]} create** <название> - создать за ${tools.separateThousandth(price)}:cookie:` +
          `\n**${this.aliases[0]} add/rem** <@>, @... - пригласить/исключить` +
          `\n**${this.aliases[0]} leave** - выйти` +
          `\n**${this.aliases[0]} desc** <описание> - добавить описание` +
          `\n**${this.aliases[0]} info** [имя гильдии] - информация о гильдии` +
          `\n**${this.aliases[0]} list** - список гильдий` +
          `\n**${this.aliases[0]} master** <@> - передать гильдмастера` +
          `\n**${this.aliases[0]} dissolve** - распустить гильдию (печенье будет возвращено)` +
          `\n*Можно состоять только в одной гильдии*`
        );
      return message.channel.send(embed);
    }

    const serverGuilds = await guilds.gets(message.guild.id);
    const myGuild = await guilds.get(message.guild.id, message.author.id);
    const guildmember = !!myGuild ? true : false;
    const ownerGuild = await guilds.owner(message.guild.id, message.author.id);
    const guildmaster = !!ownerGuild ? true : false;

    if (args[0] === 'create') {
      if (guildmember || guildmaster) {
        throw new CustomError('сначала нужно покинуть текущую гильдию!');
      }

      const name = args.slice(1).join(' ');
      if (!serverGuilds!.filter(guild => guild.name === name)) {
        throw new CustomError('такое название уже есть!');
      }

      await economy.pay(message.guild.id, message.author.id, price);

      embed
        .setDescription(
          `Поздравляю, ты стал гильдмастером **${name}**!`
        );

      return message.channel.send(embed);
    }

    if (!serverGuilds) {
      throw new CustomError('на сервере нет гильдий, но ты здесь и мы можем это исправить!');
    }

    if (args[0] === 'add' || args[0] === 'rem') {
      message.mentions.members.size
    } else if (args[0] === 'leave') {
      // гильдмастер?
    } else if (args[0] === 'desc') {
      // гильдмастер?
    } else if (args[0] === 'info') {
      // она есть?
    } else if (args[0] === 'list') {
      // они вообще есть?
    } else if (args[0] === 'master') {
      // этот челиги не гм?
    } else if (args[0] === 'dissolve') {
      // гильдмастер?
    } else {
      throw new CustomError(`такой команды нет!\n\`${message.content}\``);
    }
  },
};
