import * as Discord from 'discord.js';
import * as vars from '../modules/vars';

export default async (deleteMsg: Discord.Message) => {
  if (deleteMsg.author.bot || !deleteMsg.guild) return;

  const logsState = await vars.get(deleteMsg.guild.id, 'logs_state', undefined);
  if (logsState === 'on') {
    const logsChannelId = await vars.get(deleteMsg.guild.id, 'logs_channel', undefined);
    const channel = deleteMsg.guild.channels.find('id', logsChannelId) as Discord.TextChannel;
    if (!channel) return vars.set(deleteMsg.guild.id, 'logs_state', 'off');
    const fetchedLogs = await deleteMsg.guild.fetchAuditLogs({
      limit: 1,
      type: 'MESSAGE_DELETE',
    });

    const embed = new Discord.RichEmbed()
      .setThumbnail(deleteMsg.author.avatarURL)
      .addField("Содержание: ", deleteMsg.content || '*Содержание недоступно*')
      .setDescription(`***${deleteMsg.author} __удалил__ своё сообщение в ${deleteMsg.channel}*** `); // Удалил своё

    const deletionLog = fetchedLogs.entries.first();

    if (!!deletionLog) {
      // Это был пользователь? Если нет, то не делать запись
      if (deletionLog.targetType !== 'MESSAGE') return;
      const target = deletionLog.target as Discord.User;
      // Проверяем что жертва одно и то же лицо, вдруг мы взяли не тот лог?
      if (target.id === deleteMsg.author.id) // Удалил чужое
        embed.setDescription(`***${deletionLog.executor} __удалил__ сообщение ${deleteMsg.author} в ${deleteMsg.channel}*** `);
    }

    return channel.send(embed); // TODO: deleteMsg.attachments
  }
};
