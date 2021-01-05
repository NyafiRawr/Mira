import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Проверка связи',
  aliases: ['pinguin', 'pong'],
  cooldown: {
    seconds: 10,
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Message) {
    message.channel
      .send('Проверка связи.. :ping_pong:')
      .then((msg: Message) => {
        msg.edit(
          new MessageEmbed()
            .setColor(config.colors.alert)
            .setDescription(
              `Задержка: ${
                msg.createdTimestamp - message.createdTimestamp
              } мс` + `\nWebSocket: ${Math.round(message.client.ws.ping)} мс`
            )
        );
      });
  },
};
