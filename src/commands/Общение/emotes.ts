import * as Discord from 'discord.js';
import Axios from 'axios';

import config from '../../config';
import * as tools from '../../utils/tools';

const gifs = tools.getData('gifs');

const cats: string[] = [];
const emotions: string[] = [];

Object.keys(gifs).forEach(category => {
  cats.push(category);
  emotions.push(
    `${config.bot.prefix}**${category}** [@] - ${gifs[category].description}`
  );
});

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Список эмоций',
  aliases: ['ems', 'emotions'].concat(cats),
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: undefined,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message) {
    const emotion = message.content
      .substr(config.bot.prefix.length)
      .split(/ +/)[0];

    const embed = new Discord.RichEmbed();

    if (cats.includes(emotion)) {
      const victim = message.mentions.users.first();

      const gif =
        gifs[emotion].gif[tools.randomInteger(0, gifs[emotion].gif.length - 1)];

      if (!!victim && victim.id !== message.author.id) {
        const msg =
          gifs[emotion].msg[
            tools.randomInteger(0, gifs[emotion].msg.length - 1)
          ];
        embed.setDescription(
          msg.replace(/\$1/g, message.author).replace(/\$2/g, victim)
        );
      }

      const response = await Axios.get(gif);
      embed.setImage(response.data.url);

      embed.setColor('#ffffff');
    } else {
      embed.setAuthor('Список доступных эмоций');
      embed.setDescription(emotions.join('\n').substring(0, 1024));
      embed.setColor(tools.randomHexColor());
    }

    embed.setFooter(
      tools.embedFooter(message, emotion),
      message.author.displayAvatarURL
    );

    message.channel.send({ embed });
  },
};
