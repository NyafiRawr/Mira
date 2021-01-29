import { GuildMember, Message } from 'discord.js';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Показать аватар',
  aliases: ['avatar', 'img'],
  usage: '[@ ИЛИ никнейм ИЛИ tag]',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    let member: GuildMember | undefined | null =
      message.mentions.members!.first() || message.member;

    if (message.mentions.members!.size === 0 && args.length) {
      const target = args.join(' ');
      member = message.guild!.members.cache.find(
        (m) => m.nickname == target || m.user.tag == target
      );
    }

    if (!member) {
      throw new Error(`не удалось найти указанного участника.`);
    }

    await message.channel.send({
      embed: {
        color: member.displayColor,
        title: `Аватар ${member.displayName}`,
        image: { url: member.user.displayAvatarURL() },
      },
    });
  },
};
