import * as Discord from 'discord.js';
import * as vars from '../modules/vars';

export default async (oldMsg: Discord.Message, newMsg: Discord.Message) => {
  if (newMsg.author.bot || !newMsg.guild) return;
  const logsState = await vars.get(newMsg.guild.id, 'logs_state', undefined);
  if (logsState === 'on') {
    const logsChannelId = await vars.get(newMsg.guild.id, 'logs_channel', undefined);
    const channel = newMsg.guild.channels.find('id', logsChannelId) as Discord.TextChannel;
    if (!channel) {
      await vars.set(newMsg.guild.id, 'logs_state', 'off');
    } else {
      const embed = new Discord.RichEmbed()
        .setThumbnail(newMsg.author.avatarURL)
        .setDescription(`***${newMsg.author} отредактировал своё сообщение в ${newMsg.channel}*** `)
        .addField("Раньше: ", oldMsg.content || '-')
        .addField("Теперь: ", newMsg.content || '-');
      return channel.send(embed);
    }
  }
};
