import { Message, TextChannel } from 'discord.js';

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Сказать что-нибудь',
    aliases: ['write'],
    usage: '[#канал] <что сказать>',
    permissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message, args: string[]) {
        if (args.length == 0) {
            throw new Error('я скажу..., а что и куда сказать нужно было?');
        }

        const channel =
            message.mentions.channels.first() ||
            (message.channel as TextChannel);
        if (!channel?.permissionsFor(message.author)?.has(this.permissions)) {
            throw new Error(
                'нужны привилегии управлять и отправлять сообщения в указанном канале!'
            );
        }

        if (message.mentions.channels.size) {
            channel.send(args.slice(1).join(' '));
        } else {
            channel.send(args.join(' '));
        }
    },
};
