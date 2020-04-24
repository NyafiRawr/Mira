import * as Discord from 'discord.js';
import CustomError from '../../utils/customerror';
import * as economy from '../../modules/economy';
import * as vars from '../../modules/vars';
import * as guilds from '../../modules/guilds';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Гильдии (свой чат и голосовой канал)',
  aliases: ['g'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  permisions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed()
      .setAuthor(this.description, message.guild.iconURL)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    const price = await vars.get(message.guild.id, this.name + '_' + 'price', 150000); // Цена по умолчанию

    if (!args.length) {
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
          `\n*Важно: можно состоять только в одной гильдии*`
        );
      return message.channel.send(embed);
    }

    if (args[0] === 'cat') {
      const categoryId = args[1];
      if (!categoryId)
        throw new CustomError(`необходимо указать ID категории при вызове команды: \`${this.aliases[0]} cat <id>\``);
      await vars.set(message.guild.id, this.name + '_' + 'category', categoryId);
    }

    const serverGuilds = await guilds.getAllGuildsServer(message.guild.id);

    const ownerGuild = await guilds.getGuildOwner(message.guild.id, message.author.id);
    const guildmaster = !!ownerGuild ? true : false;

    const memberGuild = await guilds.getGuildMember(message.guild.id, message.author.id);
    const guildmember = !!memberGuild ? true : false;

    if (args[0] === 'create') {
      if (guildmember || guildmaster)
        throw new CustomError('сначала нужно покинуть текущую гильдию!');

      const name = args.slice(1).join(' ');
      if (!!serverGuilds!.filter(guild => guild.name === name))
        throw new CustomError('такое название уже есть!');

      const category = await vars.get(message.guild.id, this.name + '_' + 'category', null); // Категория по умолчанию
      if (!category)
        throw new CustomError(
          `не установлена категория для создания каналов гильдий! Попросите администратора использовать команду: \`${this.aliases[0]} cat <id>\``
        );

      if (!message.member.hasPermissions(this.permisions[1])) {
        throw new CustomError(
          'мне нужно право управлять каналами, чтобы создать каналы гильдии!'
        );
      }

      await economy.pay(message.guild.id, message.author.id, price);

      const guildChat = (await message.guild.createChannel(name, {
        type: 'text',
        permissionOverwrites: [
          {
            id: message.member.id,
            allow: [
              'VIEW_CHANNEL',
              'SEND_MESSAGES',
              'MANAGE_MESSAGES',
              'MANAGE_CHANNELS'
            ],
          },
          {
            id: message.guild.defaultRole,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        parent: category,
      })) as Discord.VoiceChannel;

      const guildVoice = (await message.guild.createChannel(name, {
        type: 'voice',
        permissionOverwrites: [
          {
            id: message.member.id,
            allow: [
              'VIEW_CHANNEL',
              'CONNECT',
              'SPEAK',
              'USE_VAD',
              'MUTE_MEMBERS',
              'DEAFEN_MEMBERS',
              'MANAGE_CHANNELS'
            ],
          },
          {
            id: message.guild.defaultRole,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        parent: category,
      })) as Discord.VoiceChannel;

      await guilds.set(message.guild.id, message.author.id, {
        name,
        description: 'Моя гильдия', // Описание по умолчанию
        chatId: guildChat.id,
        voiceId: guildVoice.id
      });

      embed
        .setDescription(
          `Поздравляю, гильдия **${name}** создана!`
        );

      return message.channel.send(embed);
    }

    if (!serverGuilds) {
      throw new CustomError('на сервере нет гильдий, но ты здесь и мы можем это исправить!');
    }

    if (args[0] === 'add' || args[0] === 'rem') {
      if (!message.mentions.members.size)
        throw new CustomError('нельзя добавить пустоту');
      await guilds.addMember(message.guild.id, message.author.id, message.mentions.members.first());
      chat voice
    } else if (args[0] === 'leave') {
      if (guildmaster)
        throw new CustomError('нельзя покинуть гильдию, потому что ты гильдмастер!');
    } else if (args[0] === 'info') {
      const name = args.slice(1).join(' ');
      поиск по имени
    } else if (args[0] === 'list') {
      serverGuilds
    }

    if (!guildmaster)
      throw new CustomError('ты не гильдмастер!');

    if (args[0] === 'desc') {
      const description = args.slice(1).join(' ');
      await guilds.set(message.guild.id, message.author.id, {
        description
      });
      return message.reply(`описание гильдии изменено на:\n${description}`);
    } else if (args[0] === 'master') {
      // HOW?
      return message.reply(`управление гильдией передано ${message.mentions.members.first()}`);
    } else if (args[0] === 'dissolve') {
      // TODO: дать возможность админу удалять ги
      await guilds.remove(message.guild.id, message.author.id);
      return message.reply(`гильдия распущена!`); // TODO: сообщить членам?
    }
  },
};
