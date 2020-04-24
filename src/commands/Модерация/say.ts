import * as Discord from 'discord.js';
import CustomError from '../../utils/customerror';

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
  async execute(message: Discord.Message, args: string[]) {
    // TODO: webhooks
    /*
    message.channel.createWebhook("Example Webhook", "https://i.imgur.com/p2qNFag.png")
      .then(wb => webhooks.set(message.guild.id, wb.id, wb.token));
    webhooks.get(vars.get)
    const mentionHook = new Discord.WebhookClient("Webhook ID", "Webhook Token");
   */
    let edit = false;
    let targetChannel: Discord.GuildChannel;
    let targetMessageId = '';
    let targetText = '';

    let newArgs = args;

    targetText = newArgs.join(' ');
    if (targetText === '') {
      throw new CustomError('я скажу... а что сказать нужно было?');
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
            `сообщение для редакта не найдено!` +
              `\nКанал: ${targetChannel}\nID: ${targetMessageId}` +
              `\nНовый текст: \`\`\`fix\n${targetText.substr(
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
        throw new CustomError(
          'у тебя нет прав управлять/отправлять сообщения!'
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
