import { Message } from 'discord.js';

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Забанить на сервере по ID',
    usage: '<ID> [Причина]',
    permissions: ['ADMINISTRATOR'],
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message, args: string[]) {
        if (!message.member?.hasPermission(this.permissions[0])) {
            throw new Error(
                `нужно иметь глобальную привилегию ${this.permissions[0]}.`
            );
        }

        const userId = args.shift();
        if (userId === undefined) {
            throw new Error(`не указан ID пользователя.`);
        }

        const reason = args.join(' ') || 'Без причины';

        try {
            await message.guild!.members.ban(userId, { reason });
        } catch (err) {
            throw new Error(`не получилось забанить: \`${err}\`.`);
        }

        return message.reply(
            `пользователь с ID: ${userId} забанен по причине: ${reason}.`
        );
    },
};
