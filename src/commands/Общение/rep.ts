import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as users from '../../modules/users';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Press F to pay respect',
  aliases: ['respect', 'reputation', 'like', 'F'],
  usage: ['<@>'],
  guild: true,
  hide: false,
  cooldown: 75600,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message) {
    if (message.mentions.members.size !== 1) {
      throw new CustomError('необходимо упомянуть того кому хочешь нажать F!');
    }

    if (message.mentions.members.first().id === message.author.id) {
      throw new CustomError('самому себе нельзя нажать F ;(');
    }

    const dbUser = await users.get(
      message.guild.id,
      message.mentions.members.first().id
    );
    const rep = dbUser?.reputation || 0;
    await users.set(message.guild.id, message.mentions.members.first().id, {
      reputation: rep + 1,
    });

    message.channel.send(
      `${
        message.author
      } жмёт F для ${message.mentions.members.first()}! (единиц уважения: ${rep +
        1})`
    );
  },
};
