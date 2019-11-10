module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Сказать что-нибудь',
  aliases: undefined,
  usage: '[edit] [#канал] [id-сообщения] <что сказать>',
  guild: true,
  hide: true,
  cooldown: 1,
  cooldownMessage: undefined,
  permissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message, args /* , CooldownReset */) {
    let edit = false;
    let targetChannel = message.mentions.channels.first();
    let targetMessageId = null;
    let targetText = null;

    let newArgs = args;

    if (newArgs.length === 0) {
      return message.reply('вы не указали, что нужно сказать.');
    }

    if (newArgs[0].toString() === 'edit') {
      edit = true;
      newArgs = newArgs.slice(1);
    }

    if (newArgs[0] === (targetChannel ? targetChannel.toString() : undefined)) {
      if (!targetChannel.permissionsFor(message.member).has(this.permissions[0])) {
        return message.reply('у тебя недостаточно привилегий в указанном канале!');
      } if (!targetChannel.permissionsFor(message.client.user).has(this.permissions[1])) {
        return message.reply('у меня нет возможности отправлять сообщения в указанном канале!');
      }
      newArgs = newArgs.slice(1);
    } else {
      targetChannel = message.channel;
      if (!targetChannel.permissionsFor(message.member).has(this.permissions[0])) {
        return message.reply('недостаточно привилегий!');
      }
    }

    if (edit && !Number.isNaN(parseInt(newArgs[0], 10))) {
      targetMessageId = String(newArgs[0]);
      newArgs = newArgs.slice(1);
    }

    targetText = newArgs.join(' ');

    if (targetText === '') {
      return message.reply('вы не указали, что нужно сказать.');
    }

    if (edit) {
      targetChannel.fetchMessage(targetMessageId)
        .then((targetMessage) => targetMessage.edit(targetText))
        .catch((error) => {
          message.reply(`сообщение для редактирования не найдено!\nКанал: ${targetChannel}\nID: ${targetMessageId}\nОтправляемый текст: \`\`\`fix\n${targetText.substr(0, 1424)}\`\`\` ${error}`);
        });
    } else {
      targetChannel.send(targetText);
    }
  },
};
