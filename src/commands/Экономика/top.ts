import * as Discord from 'discord.js';
import CustomError from '../../utils/customerror';
import * as tools from '../../utils/tools';
import * as users from '../../modules/users';

const topSize = 10;
const rangs = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Печеньковые богачи',
  aliases: ['cootop'],
  usage: undefined,
  guild: true,
  hide: false,
  cooldown: 5,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message) {
    const base = await users.getAll(message.guild.id);
    if (!base) {
      throw new CustomError(
        'в этом мире нет печенья... но я здесь и вместе мы сможем исправить это!'
      );
    }

    const onlyLiveHumans = new Array();
    base.forEach((user: any) => {
      const member = message.guild.members.get(user.id);
      if (!!member && !member.user.bot && user.balance > 0) {
        onlyLiveHumans.push({
          id: user.id,
          balance: user.balance,
        });
      }
    });

    const maxTopSize =
      topSize > onlyLiveHumans.length ? onlyLiveHumans.length : topSize;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < maxTopSize; i += 1) {
      // tslint:disable-next-line: prefer-for-of
      for (let j = i + 1; j < onlyLiveHumans.length; j += 1) {
        if (onlyLiveHumans[i].balance < onlyLiveHumans[j].balance) {
          const temp = onlyLiveHumans[i];
          onlyLiveHumans[i] = onlyLiveHumans[j];
          onlyLiveHumans[j] = temp;
        }
      }
    }

    const msg: any[] = [];
    onlyLiveHumans.slice(0, maxTopSize).forEach(user => {
      const member = message.guild.members.get(user.id);
      if (member) {
        msg.push(
          `  **${rangs[msg.length]}. ${
            !member || !member.nickname ? member.user.username : member.nickname
          }** ${tools.separateThousandth(user.balance)}:cookie:`
        );
      }
    });

    message.reply(`**печеньковые богачи:**\n${msg.join('\n')}`);
  },
};
