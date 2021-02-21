import { Message } from 'discord.js';
import config from '../../config';
import * as users from '../../modules/users';

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Твой день рождения',
    aliases: ['birthday', 'myday', 'birth'],
    usage: '[24.06.1997]',
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message, args: string[]) {
        const user = await users.get(message.guild!.id, message.author.id);
        const dateParse = args.join(' ').split('.');
        if (dateParse.length == 3) {
            const date = new Date(
                `${dateParse[2]}-${dateParse[1]}-${dateParse[0]}`
            );

            if (isNaN(date.getTime())) {
                throw new Error('неправильно указана дата, перепроверь себя.');
            }

            await user.update({ birthday: date });
            return message.channel.send({
                embed: {
                    color: config.colors.message,
                    description: `${message.author}, дата рождения занесена в профиль!`,
                    footer: {
                        text:
                            'Я поздравлю тебя с днём рождения, если буду в сети ;)',
                    },
                },
            });
        } else {
            await user.update({ birthday: null });
            return message.channel.send({
                embed: {
                    color: config.colors.message,
                    description: `Данные о дате рождения ${message.author} уничтожены.`,
                },
            });
        }
    },
};
