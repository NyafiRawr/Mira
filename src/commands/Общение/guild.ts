import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
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
  permissions: ['ADMINISTRATOR', 'MANAGE_CHANNELS'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed()
      .setAuthor(this.description, message.guild.iconURL)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    const price = await vars.get(message.guild.id, 'guild_price', 150000); // Цена по умолчанию

    if (!args.length || args[0] === 'help') {
      embed
        .setDescription(
          `**${this.aliases[0]} list** - список гильдий (можно состоять только в одной гильдии)` +
          `\n**${this.aliases[0]} info** [имя гильдии] - информация о гильдии` +
          `\n**${this.aliases[0]} leave** - покинуть гильдию\n` +
          `\n **${this.aliases[0]} create** [название] - создать за ${tools.separateThousandth(price)}:cookie:` +
          '\n*Важно: пересоздайте гильдию если случайно удалили её каналы*' +
          `\n**${this.aliases[0]} invite/kick** <@> - пригласить/исключить` +
          `\n**${this.aliases[0]} desc** <описание> - изменить описание` +
          `\n**${this.aliases[0]} master** <@> - передать гильдмастера` +
          `\n**${this.aliases[0]} dissolve** <@гильдмастера - только для админов> - распустить гильдию (если гильдмастер, то печенье будет возвращено)\n` +
          `\n**${this.aliases[0]} cat** <id> - указать категорию для войса и чатов гильдий (для админов)` +
          `\n**${this.aliases[0]} price** <цена> - указать цену гильдии (для админов)`
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
      await vars.set(message.guild.id, catOrPrice ? 'guild_category' : 'guild_price', args[1]);

      if (catOrPrice)
        return message.reply(`категория __**<#${args[1]}>**__ теперь является местом для создания гильдканалов.`);
      else
        return message.reply(`новая цена гильдий: **${args[1]}**:cookie:`);
    }

    const serverGuilds = await guilds.getAllGuildsServer(message.guild.id);
    const masterGuild = await guilds.getGuildOwner(message.guild.id, message.author.id);
    const memberGuild = await guilds.getGuildMember(message.guild.id, message.author.id);

    if (args[0] === 'create') {
      const category = await vars.get(message.guild.id, 'guild_category', null); // Категория по умолчанию
      if (!category)
        throw new CustomError(
          `не установлена категория для создания каналов гильдий! Попросите администратора использовать команду: \`${this.aliases[0]} cat <id>\``
        );

      const name = args.slice(1).join(' ');
      if (!name) {
        const haveGuild = masterGuild?.name || memberGuild?.name;
        if (!!haveGuild) await guilds.recreateChats(message, haveGuild, category, message.author.id);
        return message.reply('каналы гильдии проверены.');
      }
      else {
        const existGuilds = serverGuilds!.filter(guild => guild.name === name);
        if (!!existGuilds.length) {
          throw new CustomError('такое название уже есть!');
        }
      }

      if (!!memberGuild || !!masterGuild)
        throw new CustomError('сначала нужно покинуть текущую гильдию!');

      if (!message.guild.members.get(message.client.user.id)?.hasPermissions(this.permissions[1])) {
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
      let guildOnName = masterGuild || memberGuild;

      const name = args.slice(1).join(' ');
      if (name.trim().length) {
        guildOnName = await guilds.getGuildName(message.guild.id, name);
        if (!guildOnName) throw new CustomError(`гильдия \`${name}\` не найдена!`);
      }

      if (!guildOnName) throw new CustomError(`у тебя нет гильдии и ты не указал имя, которое тебе интересно!`);

      const members = await guilds.getMembersGuild(message.guild.id, guildOnName!.id);

      embed
        .setTitle(`Информация о гильдии: ${guildOnName!.name}`)
        .setDescription(
          `**Владелец:** <@${guildOnName!.ownerId}> | **Участники:** ${members?.length || 0}\n\n`
          + `**Описание:** ${guildOnName!.description}\n\n`
          + `**Чат:** <#${guildOnName!.chatId}> | **Войс:** <#${guildOnName!.voiceId}>`
        );
      return message.channel.send(embed);
    } else if (args[0] === 'list') {
      const list = serverGuilds.map(guild => `  ${guild.id}. **${guild.name}** | Владелец: <@${guild.ownerId}>\n`).slice(0, 24); // Примерная вместимость;
      embed
        .setDescription(
          '**Список гильдий на сервере**\n'
          + (!!list.length ? list : '*Гильдий нет, ||но я тут и мы можем исправить это!||*')
        );
      return message.channel.send(embed);
    }

    if (args[0] === 'dissolve') {
      if (message.member.hasPermission(this.permissions[0]) && message.mentions.members.size)
        await guilds.remove(message.guild.id, message.mentions.members.first().id, message);
      else {
        if (!masterGuild) throw new CustomError('ты не гильдмастер!');
        await guilds.remove(message.guild.id, message.author.id, message);
      }

      message.reply(`гильдия гильдмастера ${message.mentions.members.first() || message.author}, если она существовала, распущена!`);
      return economy.set(message.guild.id, message.mentions.members.first().id || message.author.id, price);
      // TODO: сообщить членам о роспуске? например в лс "гильдия на сервере распущена"
    }

    if (!masterGuild) throw new CustomError('ты не гильдмастер!');

    if (args[0] === 'desc') {
      const description = args.slice(1).join(' ');
      await guilds.set(message.guild.id, message.author.id, {
        description
      });
      return message.reply(`описание гильдии изменено на: ${description}`);
    }

    if (message.mentions.members.first().id === message.author.id)
      throw new CustomError('операции над самим собой недоступны.');

    if (message.mentions.members.first().id === message.client.user.id)
      throw new CustomError('операции со мной недоступны.');

    if (['invite', 'kick'].includes(args[0])) {
      if (!message.mentions.members.size)
        throw new CustomError('необходимо упомянуть необходимого человека при вызове команды.');

      const access = args[0] === 'invite' ? true : false;

      const target = message.mentions.members.first();
      if (access) {
        message.channel.send(`${target} гильдмастер ${message.author} предлагает вступить в свою гильдию, если хочешь напиши: \`да\`, иначе что угодно`);
        const answer = await menu.waitMessage(message.channel, target.id);
        if (answer === 'да') {
          await guilds.addMember(message.guild.id, target.id, masterGuild.id);
        } else return message.reply(`приглашение для ${target} отклонено.`);
      } else await guilds.removeMember(message.guild.id, target.id, masterGuild.id);
      await message.guild.channels.get(masterGuild.voiceId)?.overwritePermissions(target.id, {
        VIEW_CHANNEL: access,
        CONNECT: access,
        SPEAK: access,
        USE_VAD: access,
      });
      await message.guild.channels.get(masterGuild.chatId)?.overwritePermissions(target.id, {
        VIEW_CHANNEL: access,
      });

      return message.reply(access ?
        (`в гильдии новичок ${target}!`) : (`из гильдии исключен ${target}.`));
    } else if (args[0] === 'master') {
      if (!message.mentions.members.size)
        throw new CustomError('необходимо упомянуть нового гильдмастера.');
      const target = message.mentions.members.first();
      const itMember = await guilds.getGuildMember(message.guild.id, target.id);
      const itOwner = await guilds.getGuildOwner(message.guild.id, target.id);
      if (!itMember && !itOwner) {
        message.channel.send(`${target} гильдмастер ${message.author} предлагает взять управление над его гильдией, если согласен напиши: \`согласен\`, иначе что угодно`);
        const answer = await menu.waitMessage(message.channel, target.id);
        if (answer === 'да') await guilds.set(message.guild.id, message.author.id, { ownerId: target.id });
        else return message.reply(`приглашение для ${target} отклонено.`);
        return message.reply(`управление гильдией передано ${target}! Используй команду \`g info\` чтобы узнать о ней.`);
      } else {
        throw new CustomError(`невозможно передать управление, потому что ${target} состоит в гильдии`);
      }
    }
  },
};
