module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Удаление сообщений',
  aliases: ['remove', 'clear', 'prune', 'clean', 'rem'],
  usage: '[@писатель] <кол-во>',
  guild: true,
  hide: false,
  cooldown: 1.5,
  cooldownMessage: undefined,
  permissions: ['MANAGE_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message, args /* , CooldownReset */) {
    if (!message.channel.permissionsFor(message.member).has(this.permissions[0])) {
      return message.reply('у тебя недостаточно прав!');
    } if (!message.channel.permissionsFor(message.client.user).has(this.permissions[0])) {
      return message.reply('у меня нет прав управлять сообщениями!');
    }

    const user = message.mentions.users.first();
    const val = parseInt(args[0], 0);
    const amount = val || parseInt(args[1], 0);

    if (!amount && !user) {
      return message.reply('пожалуйста, укажите участника и количество или только количество!');
    } if (!amount || amount < 1 || amount > 100) {
      return message.reply('пожалуйста, укажите число в диапазоне от 1 до 100.');
    }

    message.channel.fetchMessages({
      limit: amount,
    }).then((messages) => {
      let userMsg = messages;
      if (user) {
        const filterBy = user ? user.id : message.client.user.id;
        userMsg = messages.filter((m) => m.author.id === filterBy).array().slice(0, amount);
      }
      message.channel.bulkDelete(userMsg)
        .then((msgs) => {
          message.channel.send(`Удалено сообщений: **${msgs.size}** ${message.author}\nСамоуничтожение через несколько секунд :alarm_clock:`)
            .then((msg) => {
              setTimeout(() => msg.delete(), 3000);
            });
        })
        .catch((error) => message.reply(`невозможно удалить сообщения, потому что: \n${error}`));
    });
  },
};
