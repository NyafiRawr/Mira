import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import { randomInteger } from '../../utils';

const body = {
    color: config.colors.message,
    author: {
        name: 'Бросаю кубик и выпадает ...',
    },
};

const gifs = [
    'https://media1.tenor.com/images/2c6ddd9638e5e4115b44c5424d5cc1d8/tenor.gif?itemid=4627934', // https://media1.tenor.com/images/e2edbb1a3bd86268199e5e41d5be0c0f/tenor.gif?itemid=17637774
    '',
    'https://media1.tenor.com/images/a88e7210818f915636c2e66b39674885/tenor.gif?itemid=19540628',
    'https://media1.tenor.com/images/9698b9a4e8f3de12e33e726c7e98ee4e/tenor.gif?itemid=19122056',
    '',
    '',
];
const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Бросить кубик',
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    execute(message: Message) {
        const result = randomInteger(0, 5);
        const embed = new MessageEmbed(body);
        message.channel.send(
            embed.setImage(gifs[result]).setTitle(`${emojis[result]}`)
        );
    },
};
