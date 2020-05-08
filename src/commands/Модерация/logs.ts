import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as vars from '../../modules/vars';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Логи сообщений',
  aliases: ['log'],
  usage: 'on / off / <#канал куда их складывать>',
  guild: true,
  hide: true,
  cooldown: 3,
  cooldownMessage: undefined,
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0]))
      throw new CustomError('нужно быть администратором!');

    if (!!message.mentions.channels.size) {
      await vars.set(message.guild.id, 'logs_channel', message.mentions.channels.first().id);
      return message.reply(`канал <#${message.mentions.channels.first().id}> теперь используется для логов!`);
    }

    if (['on', 'off'].includes(args[0])) {
      await vars.set(message.guild.id, 'logs_state', args[0]);
      const channel = await vars.get(message.guild.id, 'logs_channel', undefined);
      if (!channel) {
        await vars.set(message.guild.id, 'logs_channel', message.channel.id);
        return message.reply(`запись логов переключена в состояние: **${args[0]}** в этом канале.`);
      } else {
        return message.reply(`запись логов переключена в состояние: **${args[0]}**`);
      }
    }
    else
      throw new CustomError('ошибка в вызове команды.');
  },
};
