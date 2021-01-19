import { Message } from 'discord.js';
import * as users from '../../modules/users';
import * as economy from '../../modules/economy';
import { randomHexColor } from '../../utils';

const priceReputation = 100;

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: `Press F to pay respect ${priceReputation}:cookie:`,
  aliases: ['f', 'karma', 'respect', 'like'],
  usage: '<@>',
  cooldown: {
    seconds: 75600,
  },
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message) {
    const victim = message.mentions.members?.first();
    if (victim == undefined) {
      throw new Error('ты никого не упомянул!');
    }

    if (victim.id == message.author.id) {
      throw new Error('самому себе накинуть репутации нельзя ;(');
    }

    await economy.setBalance(
      message.guild!.id,
      message.author.id,
      -priceReputation
    );

    const user = await users.get(message.guild!.id, victim.id);
    await user.update({
      reputation: user.reputation + 1,
    });

    message.channel.send(`${message.author} :thumbsup: ${victim}`, {
      embed: {
        color: randomHexColor(),
        description: `**${victim.displayName} +1 к карме**`,
        image: {
          url:
            'https://media.tenor.com/images/ac97fcbb9ab4bc60f9300c44d582b790/tenor.gif',
        },
      },
    });
  },
};
