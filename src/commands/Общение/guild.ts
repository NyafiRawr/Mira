import * as Discord from 'discord.js';
import CustomError from '../../utils/customerror';
import * as economy from '../../modules/economy';
import * as vars from '../../modules/vars';
import * as guilds from '../../modules/guilds';
import * as tools from '../../utils/tools';
import * as menu from '../../utils/menu';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Гильдии (свой чат и голосовой канал)',
  aliases: ['g'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 3,
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
          '\nВажно: пересоздайте гильдию если случайно удалили её каналы.' +
          `\n**${this.aliases[0]} invite/kick** <@> - пригласить/исключить` +
          `\n**${this.aliases[0]} leave** - выйти` +
          `\n**${this.aliases[0]} desc** <описание> - добавить описание` +
          `\n**${this.aliases[0]} info** [имя гильдии] - информация о гильдии` +
          `\n**${this.aliases[0]} list** - список гильдий` +
          `\n**${this.aliases[0]} master** <@> - передать гильдмастера` +
          `\n**${this.aliases[0]} dissolve** <@гильдмастера - только для админов> - распустить гильдию (если гильдмастер, то печенье будет возвращено)` +
          `\n**${this.aliases[0]} cat** <id> - указать категорию для войса и чатов гильдий (для админов)` +
          `\n**${this.aliases[0]} price** <цена> - указать цену гильдии (для админов)` +
          `\n*Важно: можно состоять только в одной гильдии*`
        );
      return message.channel.send(embed);
    }

    if (['cat', 'price'].includes(args[0])) {
      if (!message.member.hasPermission(this.permissions[0]))
        throw new CustomError('тебе нужно быть администратором!');

      const catOrPrice = args[0] === 'cat';
      if (!args[1])
        throw new CustomError(`необходимо указать ${catOrPrice ? 'ID категории' : 'новую цену'} при вызове команды!`);
      const n = parseInt(args[1], 10);
      if (!Number.isInteger(n))
        throw new CustomError(`это должно быть целым числом!`);
      await vars.set(message.guild.id, this.name + '_' + catOrPrice ? 'category' : 'price', args[1]);
    }

    const serverGuilds = await guilds.getAllGuildsServer(message.guild.id);
    const masterGuild = await guilds.getGuildOwner(message.guild.id, message.author.id);
    const memberGuild = await guilds.getGuildMember(message.guild.id, message.author.id);

    if (args[0] === 'create') {
      const category = await vars.get(message.guild.id, this.name + '_' + 'category', null); // Категория по умолчанию
      if (!category)
        throw new CustomError(
          `не установлена категория для создания каналов гильдий! Попросите администратора использовать команду: \`${this.aliases[0]} cat <id>\``
        );

      const name = args.slice(1).join(' ');
      if (!name)
        throw new CustomError('необходимо указать название!');
      if (!!serverGuilds!.filter(guild => guild.name === name)) {
        await guilds.recreateChats(message, name, category, message.author.id);
        throw new CustomError('такое название уже есть! Но каналы данной гильдии были перепроверены и воссозданы.');
      }

      if (!!memberGuild || !!masterGuild)
        throw new CustomError('сначала нужно покинуть текущую гильдию!');

      if (!message.member.hasPermissions(this.permisions[1])) {
        throw new CustomError(
          'мне нужно право управлять каналами, чтобы создать каналы гильдии!'
        );
      }

      await economy.pay(message.guild.id, message.author.id, price);

      const { guildChat, guildVoice } = await guilds.recreateChats(message, name, category, message.author.id);

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
      const guildOnName = await guilds.getGuildName(message.guild.id, name);
      if (!guildOnName) throw new CustomError(`гильдия \`${name}\` не найдена!`);
      embed.setDescription(
        `${guildOnName.id}. **${guildOnName.name}** <@${guildOnName.ownerId}>\n`
        + `**Описание:** ${guildOnName.description}\n\n`
        + `**Чат:** <#${guildOnName.chatId}>. **Войс:** <#${guildOnName.voiceId}>\n`
        + `**Участники:** ${guilds.getAmountMembers(message.guild.id, guildOnName.id) || 0}`
      );
      return message.channel.send(embed);
    } else if (args[0] === 'list') {
      embed
        .setDescription(
          '**Список гильдий на сервере**\n'
          + serverGuilds.map(guild => `${guild.id}. **${guild.name}** <@${guild.ownerId}>\n`).slice(0, 24) // Примерная вместимость
        );
      return message.channel.send(embed);
    }

    if (!masterGuild)
      throw new CustomError('ты не гильдмастер!');

    if (!!message.mentions.members.filter(member => member.id === message.author.id))
      throw new CustomError('операции над самим собой недоступны.');

    if (['invite', 'kick'].includes(args[0])) {
      if (!message.mentions.members.size)
        throw new CustomError('необходимо упомянуть необходимого человека при вызове команды.');

      const access = args[0] === 'invite' ? true : false;

      const target = message.mentions.members.first();
      if (access) {
        message.channel.send(`${target} гильдмастер ${message.author} предлагает вступить в свою гильдию, если хочешь напиши: \`да\``);
        const answer = await menu.waitMessage(message.channel, target.id);
        if (answer === 'да') await guilds.addMember(message.guild.id, target.id, masterGuild.id);
        else return message.reply(`приглашение для ${target} отклонено.`);
      } else await guilds.removeMember(message.guild.id, target.id, masterGuild.id);
      message.guild.channels.get(masterGuild.voiceId)?.overwritePermissions(target.id, {
        VIEW_CHANNEL: access,
        CONNECT: access,
        SPEAK: access,
        USE_VAD: access,
      });
      message.guild.channels.get(masterGuild.chatId)?.overwritePermissions(target.id, {
        VIEW_CHANNEL: access,
      });

      return message.reply(access ?
        (`в гильдии новичок `) : (`из гильдии исключен `) + target);
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
      if (message.member.hasPermission(this.permissions[0]) && !message.mentions.members.size)
        await guilds.remove(message.guild.id, message.mentions.members.first().id);
      else await guilds.remove(message.guild.id, message.author.id);
      return message.reply(`гильдия гильдмастера ${message.mentions.members.first() || message.author}, если она существовала, распущена!`);
      // TODO: сообщить членам о роспуске? например в лс "гильдия на сервере распущена"
    }
  },
};
