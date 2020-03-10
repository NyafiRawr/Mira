import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as economy from '../../modules/economy';
import * as voices from '../../modules/voices';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Свой временный голосовой канал',
  aliases: ['v'],
  usage: '[create <название> / invite <@упоминание, @...>] ',
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed()
      .setAuthor(this.description, message.guild.iconURL)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    const settings = voices.get(message.guild.id);
    const price = 400; // сообщить если стандартная?

    if (args.length === 0) {
      // Создан ли уже канал?
      embed
        .setTitle('Доступные команды')
        .setDescription(
          `**${this.aliases[0]} create** [своё название голосового чата]`
          + `**${this.aliases[0]} invite** <@>, @...`
          + `Цена: ${price}:cookie:`
        );
      return message.channel.send(embed);
    }



    if (settings === null)
      throw new CustomError(
        `категория для размещения не установлена, попросите админов сделать это командой \`${this.aliases} cat <id-категории>\`!`
      );

    const tempVoiceName = `${message.member.displayName}`;

    const errorNotEnoughtArgs = `не хватает параметров, пример команды: \`${config.bot.prefix}${this.name} invite ${message.client.user}\``;

    if (args[0] === 'invite') {
      if (args.length <= 1) {
        throw new CustomError(errorNotEnoughtArgs);
      }

      const tempVoice = message.guild.channels.find('name', tempVoiceName);
      for await (const target of message.mentions.members.array()) {
        tempVoice.overwritePermissions(target.id, {
          VIEW_CHANNEL: true,
          CONNECT: true,
          SPEAK: true,
          USE_VAD: true,
        });

        const invite = await tempVoice.createInvite(
          {
            maxAge: 10 * 60 * 1000,
          },
          `Приглашение в ${tempVoice.toString()}`
        );
        await message.reply(
          `Пользователь ${target.displayName} добавлен в ${tempVoiceName}. ${invite.url}`
        );
      }
    } else if (args[0] === 'remove') {
      if (args.length <= 1) {
        throw new CustomError(errorNotEnoughtArgs);
      }

      const tempVoice = message.guild.channels.find('name', tempVoiceName);
      for await (const target of message.mentions.members.array()) {
        tempVoice.replacePermissionOverwrites({
          overwrites: tempVoice.permissionOverwrites.filter(
            perm => perm.id !== target.id
          ),
        });

        await message.reply(
          `Пользователь ${target.displayName} удален из ${tempVoiceName}`
        );
      }
    } else if (args[0] === 'create') {
      await economy.pay(
        message.guild.id,
        message.author.id,
        await this.getPrice(message.guild.id)
      );

      const tempVoice = (await message.guild.createChannel(tempVoiceName, {
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
            ],
          },
          {
            id: message.guild.defaultRole,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        parent: await this.getCategoryId(message.guild.id),
        topic: 'Канал будет удален после того, как все выйдут из него!',
      })) as Discord.VoiceChannel;

      const invite = await tempVoice.createInvite(
        {
          maxAge: 10 * 60,
          temporary: true,
        },
        `Приглашение в ${tempVoice.toString()}`
      );
      await message.reply(
        `канал __${tempVoice.toString()}__ создан! ${invite.url}`
      );

      const deleteChannel = () =>
        tempVoice
          .delete()
          .then(() =>
            message.reply(`Пустующий канал __${tempVoice.toString()}__ удалён!`)
          )
          .catch(log.error);

      setTimeout(() => {
        const watcher = setInterval(
          () =>
            tempVoice.members.size === 0 &&
            deleteChannel() &&
            clearInterval(watcher),
          2e4
        );
      }, 1e4);
    } else {

    }
  },
};
