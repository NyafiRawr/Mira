import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';

const body = new MessageEmbed()
    .setColor(config.colors.invite)
    .setAuthor('Приглашаешь к себе?')
    .setTitle('Да!')
    .setURL(
        `https://discordapp.com/oauth2/authorize?client_id=${config.discord.id}&scope=bot&permissions=${config.discord.permissions}`
    )
    .setImage(
        'https://media1.tenor.com/images/023828c4b5291432eecabdee129a1c89/tenor.gif'
    );

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Пригласить на свой сервер',
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    execute(message: Message) {
        message.channel.send(body);
    },
};
