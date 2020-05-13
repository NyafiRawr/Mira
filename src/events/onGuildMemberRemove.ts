import * as Discord from 'discord.js';
import * as vars from '../modules/vars';

export default async (member: Discord.GuildMember) => {
  const logsState = await vars.get(member.guild.id, 'logs_state', undefined);
  if (logsState === 'on') {
    const logsChannelId = await vars.get(member.guild.id, 'logs_channel', '');
    const channel = member.guild.channels.get(logsChannelId) as Discord.TextChannel;
    if (!channel) return vars.set(member.guild.id, 'logs_state', 'off');
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_KICK',
    });

    const fetchedLog = fetchedLogs.entries.first();

    if (!!fetchedLog) {
      if (fetchedLog.targetType !== 'USER') return;
      const target = fetchedLog.target as Discord.User;
      if (target.id === member.id) {
        const embed = new Discord.RichEmbed()
          .setThumbnail(member.user.avatarURL)
          .setDescription(`***${fetchedLog.executor} __кикнул__ ${member.user.tag}*** `)
          .addField('Причина: ', fetchedLog.reason || '-');

        return channel.send('@everyone', { embed });
      }
    }
  }
};
