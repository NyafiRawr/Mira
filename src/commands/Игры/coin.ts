import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import { randomBoolean } from '../../utils';

const body = {
  color: config.colors.message,
  author: {
    name: 'Бросаю монетку и выпадает ...',
  },
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Подбросить монетку',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  execute(message: Message) {
    const result = randomBoolean();
    const embed = new MessageEmbed(body);
    message.channel.send(
      embed
        .setTitle(result ? 'РЕШКА' : 'ОРЁЛ')
        .setDescription(result ? ':sparkles:' : ':eagle:')
    );
  },
};
