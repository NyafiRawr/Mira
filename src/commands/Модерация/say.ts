import * as Discord from 'discord.js';

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
  async execute(
    message: Discord.Message,
    args: string[] /* , CooldownReset */
  ) {
    let edit = false;
    let targetChannel: Discord.GuildChannel;
    let targetMessageId = '';
    let targetText = '';

    let newArgs = args;

    targetText = newArgs.join(' ');
    if (targetText === '') {
      return message.reply('вы не указали, что нужно сказать.');
    }

    if (newArgs[0] === 'edit') {
      edit = true;
      newArgs = newArgs.slice(1);

      if (edit && !Number.isNaN(parseInt(newArgs[0], 10))) {
        targetMessageId = String(newArgs[0]);
        newArgs = newArgs.slice(1);
      }

      return message.mentions.channels
        .first()
        .fetchMessage(targetMessageId)
        .then((targetMessage: any) => targetMessage.edit(targetText))
        .catch((error: any) => {
          message.reply(
            `сообщение для редактирования не найдено!\nКанал: ${targetChannel}\nID: ${targetMessageId}\nОтправляемый текст: \`\`\`fix\n${targetText.substr(
              0,
              1424
            )}\`\`\` ${error}`
          );
        });
    } else if (message.mentions.channels.size > 0) {
      targetChannel = message.guild.channels.find(
        'id',
        message.mentions.channels.first().id
      );
      if (
        !targetChannel.permissionsFor(message.member)!.has(this.permissions)
      ) {
        return message.reply(
          'у тебя недостаточно привилегий в указанном канале!'
        );
      }

      targetText = targetText.replace(`<#${targetChannel.id}>`, '');
      message.mentions.channels.first().send(targetText);
    } else {
      targetChannel = message.guild.channels.find('id', message.channel.id);
      if (
        !targetChannel.permissionsFor(message.member)!.has(this.permissions)
      ) {
        return message.reply('недостаточно привилегий!');
      }

      message.channel.send(targetText);
    }
  },
};
