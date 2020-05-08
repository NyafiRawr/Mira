import * as Discord from 'discord.js';
import * as vars from '../modules/vars';

export default async (guild: Discord.Guild, user: Discord.User) => {
  const logsState = await vars.get(guild.id, 'logs_state', undefined);
  if (logsState === 'on') {
    const logsChannelId = await vars.get(guild.id, 'logs_channel', undefined);
    const channel = guild.channels.find('id', logsChannelId) as Discord.TextChannel;
    if (!channel) return vars.set(guild.id, 'logs_state', 'off');
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_BAN_ADD',
    });

    const embed = new Discord.RichEmbed()
      .setThumbnail(user.avatarURL)
      .setDescription(`***${user.tag} __был забанен__ неизвестно кем*** `);

    const fetchedLog = fetchedLogs.entries.first();

    if (!!fetchedLog) {
      if (fetchedLog.targetType !== 'USER') return;
      const target = fetchedLog.target as Discord.User;
      if (target.id === user.id)
        embed
          .setDescription(`***${fetchedLog.executor} __забанил__ ${user.tag}***`)
          .addField('Причина: ', fetchedLog.reason || '-');
    }

    return channel.send('@everyone', { embed });
  }
};
