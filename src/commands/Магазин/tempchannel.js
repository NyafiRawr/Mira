import * as economy from '../../modules/economy';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Каталог ролей',
  aliases: ['channel'],
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
        'voice',
        [
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
        (`Created by ${message.member.displayName}`),
      );
      await tempChannel.setParent(this.categoryId);
      await tempChannel.setTopic('Канал будет удален сразу после того как все участники выйдут из него!');

      await message.reply(`Канал ${tempChannel.toString()} создан!`);
    }
  },
};
