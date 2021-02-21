import axios from 'axios';
import { Message } from 'discord.js';
import config from '../../config';
import { randomHexColor, randomInteger } from '../../utils';
import gifs from './gifs';

const body = {
    color: randomHexColor(),
    title: 'Доступные эмоции',
    description: gifs
        .map(
            (gif, key) =>
                `${config.discord.prefix}**${key}** [@] - ${gif.description}`
        )
        .join('\n'),
};

module.exports = {
    name: __filename.slice(__dirname.length + 1).split('.')[0],
    description: 'Эмоции и действия',
    aliases: [...gifs.keys()],
    group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
    async execute(message: Message, args: string[]) {
        args = message.content.substr(config.discord.prefix.length).split(/ +/);
        const emotion = args.shift()!;

        const gif = gifs.get(emotion);
        if (gif) {
            const link = gif.urls[randomInteger(0, gif.urls.length - 1)];
            const url = (await axios.get(link)).data.url;

            const victim = message.mentions.members?.first();
            return message.channel.send({
                embed: {
                    color: randomHexColor(),
                    description: victim
                        ? gif.messages[
                              randomInteger(0, gif.messages.length - 1)
                          ]
                              .replace(/\$1/g, message.author.toString())
                              .replace(/\$2/g, victim.toString())
                        : '',
                    image: { url },
                },
            });
        } else {
            return message.channel.send({
                embed: body,
            });
        }
    },
};
