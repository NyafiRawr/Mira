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
          `\n**${this.aliases[0]} invite/kick** <@>, @... - пригласить/исключить` +
          `\n**${this.aliases[0]} leave** - выйти` +
          `\n**${this.aliases[0]} desc** <описание> - добавить описание` +
          `\n**${this.aliases[0]} info** [имя гильдии] - информация о гильдии` +
          `\n**${this.aliases[0]} list** - список гильдий` +
          `\n**${this.aliases[0]} master** <@> - передать гильдмастера` +
          `\n**${this.aliases[0]} dissolve** - распустить гильдию (печенье будет возвращено)` +
          `\n**${this.aliases[0]} cat** <id> - указать категорию для войса и чата гильдий (для админов)` +
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
      if (!name)
        throw new CustomError('необходимо указать название!');
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

    if (args[0] === 'info') {
      const name = args.slice(1).join(' ');
      return поиск по имени // новая функция в guilds?
    } else if (args[0] === 'list') {
      embed
        .setDescription(
          '**Список гильдий на сервере**\n'
          + serverGuilds.forEach(guild => `__${guild.name}__ <@${guild.ownerId}>\n`)
        );
      return message.channel.send(embed); // TODO: лимиты эмбедов throwнуть
    }

    if (!guildmaster)
      throw new CustomError('ты не гильдмастер!');

    if (!!message.mentions.members.filter(member => member.id === message.author.id))
      throw new CustomError('операции над самим собой недоступны.');

    if (['invite', 'kick'].includes(args[0])) { // TODO: добавить одобрение invite
      if (!message.mentions.members.size)
        throw new CustomError('необходимо упомянуть необходимых людей при вызове команды.');

      const guildVoice = message.guild.channels.get(ownerGuild!.voiceId);
      const guildChat = message.guild.channels.get(ownerGuild!.chatId);

      const access = args[0] === 'add' ? true : false;
      for await (const target of message.mentions.members.array()) {
        if (access)
          await guilds.addMember(message.guild.id, target.id, ownerGuild!.id);
        else
          await guilds.removeMember(message.guild.id, target.id, ownerGuild!.id);
        guildVoice!.overwritePermissions(target.id, {
          VIEW_CHANNEL: access,
          CONNECT: access,
          SPEAK: access,
          USE_VAD: access,
        });
        guildChat!.overwritePermissions(target.id, {
          VIEW_CHANNEL: access,
        });
      }
      return message.reply(access ?
        (`в гильдию добавлен(ы) `) : (`из гильдии исключен(ы) `) + message.mentions.members.array());
    } else if (args[0] === 'desc') {
      const description = args.slice(1).join(' ');
      await guilds.set(message.guild.id, message.author.id, {
        description
      });
      return message.reply(`описание гильдии изменено на: ${description}`);
    } else if (args[0] === 'master') {
      if (!message.mentions.members.size)
        throw new CustomError('необходимо упомянуть нового гильдмастера.');
      await guilds.set(message.guild.id, message.author.id, { ownerId: message.mentions.members.first().id });
      return message.reply(`управление гильдией передано ${message.mentions.members.first()}! Используй команду \`g info\` чтобы узнать о ней.`);
    } else if (args[0] === 'dissolve') {
      if (admin && writeguildname) guildfordelete = name;
      else
        await guilds.remove(message.guild.id, message.author.id);
      return message.reply(`гильдия ${guild.name} распущена!`);
      // TODO: сообщить членам о роспуске? например в лс "гильдия на сервере распущена"
    }
  },
};
