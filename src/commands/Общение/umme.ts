import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as users from '../../modules/users';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Развод',
  aliases: ['unmarry'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 3000,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message) {
    const me = await users.get(message.guild.id, message.author.id);
    if (!me?.coupleId) throw new CustomError('у тебя никого нет, чтобы разводится!');

    const victim = message.guild.members.get(me.coupleId);
    if (!victim) {
      await users.set(message.guild.id, me.coupleId, { coupleId: null });
      await users.set(message.guild.id, message.author.id, { coupleId: null });
      return message.reply('похоже, что ваша пара сбежала с сервера, вы разведены.');
    }

    await users.set(message.guild.id, victim.id, { coupleId: null });
    await users.set(message.guild.id, message.author.id, { coupleId: null });
    return message.channel.send(`**${message.author} РАЗВЕЛСЯ С ${victim}.**`);
  },
};
