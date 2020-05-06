import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as warns from '../../modules/warnings';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Список запрещенных слов',
  aliases: ['bw'],
  usage: '[add/rem <список через пробел>] [allow/deny <#каналы где разрешены слова>]',
  guild: true,
  hide: true,
  cooldown: 0.5,
  cooldownMessage: undefined,
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (!message.member.hasPermission(this.permissions[0])) {
      throw new CustomError('нужно иметь право управлять сообщениями!');
    }

    if (['add', 'rem'].includes(args[0])) {
      const list = args.slice(1);
      if (!list.length) throw new CustomError('необходимо указать слово(-а) для добавления/удаления из запрещенных.');

      if (args[0] === 'add') {
        await warns.editBadWords(message.guild.id, list, true);
      }

      else if (args[0] === 'rem') {
        await warns.editBadWords(message.guild.id, list, false);
      }

      return message.reply(`слово для запрета добавлено в серверный список.`);
    }

    else if (['allow', 'deny'].includes(args[0])) {
      if (!message.mentions.channels.size) throw new CustomError('необходимо упомянуть каналы для добавления/удаления из разрешенных.');

      const ids = message.mentions.channels.map((channel) => channel.id);

      if (args[0] === 'allow') {
        await warns.editBadChannelsIds(message.guild.id, ids, true);
      }

      else if (args[0] === 'deny') {
        await warns.editBadChannelsIds(message.guild.id, ids, false);
      }

      const badChannels = await warns.getBadChannelsIds(message.guild.id);
      return message.reply(`новый список не модерируемых каналов: ${badChannels.map((channelId) => `<#${channelId}>`)?.join(', ') || 'нет'}`);
    }

    else {
      const badWords = await warns.getBadWords(message.guild.id);
      const badChannels = await warns.getBadChannelsIds(message.guild.id);
      return message.reply(
        `**автомодерация каналов!**` +
        `\n\n**Список запрещенных слов:** ${badWords?.join(', ') || 'пуст'}` +
        `\n\n**Список каналов где нет проверки на слова:** ${badChannels.map((channelId) => `<#${channelId}>`)?.join(', ') || 'нет'}`
      );
    }
  },
};
