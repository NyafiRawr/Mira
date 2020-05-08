import * as Discord from 'discord.js';
import * as users from '../../modules/users';
import CustomError from '../../utils/customError';

// tslint:disable-next-line: no-var-requires
const packageJson = require('../../../package.json');

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Фикс',
  aliases: undefined,
  usage: undefined,
  guild: false,
  hide: true,
  cooldown: 1,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    if (message.author.id !== packageJson.author.id) {
      throw new CustomError(
        `команда ${this.name} доступна только разработчику!`
      );
    }

    const usersAll = await users.getAll(message.guild.id);
    for await (const user of usersAll || []) {
      console.log(user.id);
      const member = await message.guild.members.get(user.id.toString());
      if (!member || !user.firstEntry) continue;
      console.log(member.user.tag, member.joinedAt, user.firstEntry);
      if (member.joinedAt < user.firstEntry) {
        users.set(message.guild.id, user.id.toString(), { firstEntry: member.joinedAt });
        console.log('изменено');
      }
    }

  },
};
