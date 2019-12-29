import Discord from 'discord.js';
import CustomError from '../../modules/customError';
import * as economy from '../../modules/economy';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Каталог ролей',
  aliases: ['tc'],
  usage: '[create/invite] <@упоминание>',
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],

  // todo: вынести в конфиг
  price: 400,
  categoryId: '655718840650563585',

  /**
   * Выполняет комманду и результат возвращяет пользователю
   * @param {Discord.Message} message сообщение
   * @param {string[]} args параметры запроса
   */
  async execute(message, args) {
    const tempChannelName = `Private room ${message.member.displayName}`;

    if (args[0] === 'invite') {
      // валидация параметров комманды
      if (args.length <= 1) throw new CustomError('Не хватает параметров, пример команды: !tempchannel invite @admin');

      const tempChannel = message.guild.channels.find('name', tempChannelName);
      for await (const target of message.mentions.members.array()) {
        tempChannel.overwritePermissions(target.id, {
          VIEW_CHANNEL: true,
          CONNECT: true,
          SPEAK: true,
          USE_VAD: true,
        });

        await message.reply(`Пользователь ${target.displayName} был добавлен в ${tempChannelName}`);
      }
    } else if (args[0] === 'remove') {
      // валидация параметров комманды
      if (args.length <= 1) throw new CustomError('Не хватает параметров, пример команды: !tempchannel invite @admin');

      const tempChannel = message.guild.channels.find('name', tempChannelName);
      for await (const target of message.mentions.members.array()) {
        tempChannel.replacePermissionOverwrites({
          overwrites: tempChannel.permissionOverwrites.filter((perm) => perm.id !== target.id),
        });

        await message.reply(`Пользователь ${target.displayName} был удален из ${tempChannelName}`);
      }
    } else if (args[0] === 'create') {
      await economy.pay(message.guild.id, message.author.id, this.price);

      const tempChannel = await message.guild.createChannel(
        tempChannelName,
        {
          type: 'voice',
          permissionOverwrites: [
            {
              id: message.member.id,
              allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'USE_VAD', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS'],
            },
            {
              id: message.guild.defaultRole,
              deny: ['VIEW_CHANNEL'],
            },
          ],
          parent: this.categoryId,
          topic: 'Канал будет удален сразу после того как все участники выйдут из него!',
        },
      );

      await message.reply(`Канал ${tempChannel.toString()} создан!`);

      const deleteChannel = () => tempChannel.delete()
        .then(() => message.reply(`Так как в канале ${tempChannel.toString()} ни кого не было то он был удален из за ненадобности!`))
        .catch(console.error);

      setTimeout(() => {
        const watcher = setInterval(() => tempChannel.members.size === 0 && deleteChannel() && clearInterval(watcher), 2e4);
      }, 1e4);
    }
  },
};
