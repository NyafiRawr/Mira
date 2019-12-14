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
  price: 4,
  categoryId: '655112258937946152',

  /**
   * Выполняет комманду и результат возвращяет пользователю
   * @param {Discord.Message} message сообщение
   * @param {string[]} args параметры запроса
   */
  async execute(message, args) {
    if (args[0] === 'invite') {
      // валидация параметров комманды
      if (args.length !== 2) return message.reply('Не хватает параметров, пример команды: !tempchannel invite @admin');
    } else if (args[0] === 'create') {
      // проверяем баланс и списываем за временный канал
      const balance = await economy.get(message.guild.id, message.author.id);
      if (balance < this.price) return message.reply('У вас нет сколько печенек!');
      await economy.set(message.guild.id, message.author.id, -this.price);

      // создание канала
      const tempRole = await message.guild.createRole({
        name: args[0],
        hoist: false,
        mentionable: false,
      });

      const tempChannel = await message.guild.createChannel(
        `Private ${message.member.displayName}`,
        {
          type: 'voice',
          role: [
            {
              type: 'member',
              id: message.member.id,
              allow: 17825808,
            },
            {
              type: 'role',
              id: tempRole.id,
              allow: 17825808,
            },
            {
              type: 'role',
              id: message.guild.defaultRole,
              deny: 1024,
            },
          ],
          parent: this.categoryId,
          topic: 'Канал будет удален сразу после того как все участники выйдут из него!',
        },
      );

      await message.reply(`Канал ${tempChannel.toString()} создан!`);

      const deleteChannel = () => tempChannel.delete()
        .then(() => message.reply(`Так как вы не вошли в канал ${tempChannel.toString()} то он был удален из за ненадобности!`))
        .catch(console.error);

      setTimeout(() => {
        if (!tempChannel.members.first()) deleteChannel();

        setInterval(() => tempChannel.members.size === 0 && deleteChannel(), 2e4);
      }, 1e4);
    }
  },
};
