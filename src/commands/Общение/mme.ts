import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as users from '../../modules/users';
import * as menu from '../../utils/menu';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Свадьба',
  aliases: ['marryme', 'marry'],
  usage: '@с_кем',
  guild: true,
  hide: false,
  cooldown: 3,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message) {
    if (!message.mentions.members.size) throw new CustomError('необходимо упомянуть того на ком хотите жениться!');
    const victim = message.mentions.members.first();
    if (victim.id === message.author.id) throw new CustomError('нельзя жениться на самом себе!');

    const me = await users.get(message.guild.id, message.author.id);
    if (!!me?.coupleId) throw new CustomError('гаремы не разрешены!');

    await message.channel.send(`**${victim} будь со мной!** - говорит ${message.author}, если согласна(-ен) напиши: \`ДА\`, иначе отвергни!`);
    const answer = await menu.waitMessage(message.channel, victim.id, false);
    if (!answer || answer.toLowerCase() !== 'да') {
      return message.reply(`время ответа на предложение вышло или тебя отвергли...`);
    }
    else {
      await users.set(message.guild.id, victim.id, { coupleId: message.author.id });
      await users.set(message.guild.id, message.author.id, { coupleId: victim.id });
      return message.channel.send(`**${victim} и ${message.author} поженились!**`);
    }
  },
};
