import * as Discord from 'discord.js';

import CustomError from '../../modules/customError';
import * as shop from '../../modules/shop';
import * as economy from '../../modules/economy';
import * as tools from '../../modules/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Каталог ролей',
  aliases: [],
  usage: '[all/add/rm/buy] <@роль> <стоимость в :cookie:>',
  guild: true,
  hide: false,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  cooldown: 1,
  cooldownMessage:
    'Вы наверное самая быстрая рука на диком западе, я немного не успеваю.',

  // необходимые роли для управление магазином
  managePermisions: ['MANAGE_ROLES'],

  /**
   * Выполняет комманду и результат возвращяет пользователю
   * @param {Discord.Message} message сообщение
   * @param {string[]} args параметры запроса
   */
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed();

    if (args[0] === 'all' || args.length === 0) {
      const roles = await shop.getAll(message.guild.id);
      if (!roles.length) {
        throw new CustomError('магазин пуст...');
      }

      embed.setTitle('Магазин');
      roles.forEach((role: any, idx: number) =>
        embed.setDescription(
          `${idx + 1}. ${message.guild.roles.get(role.roleId)} ${
            role.cost
          }:cookie:`
        )
      );
    } else if (args[0] === 'buy' && message.mentions.roles.size > 0) {
      const roleMention = message.mentions.roles.first();

      const roleShop = await shop.get<any>(message.guild.id, roleMention.id);
      if (roleShop === null) {
        throw new CustomError('такой роли в продаже нет.');
      }

      if (message.guild.member(message.author.id).roles.has(roleMention.id)) {
        throw new CustomError('у вас уже есть эта роль!');
      }

      await economy.pay(message.guild.id, message.author.id, -roleShop.cost);
      message.member.addRole(roleMention);

      embed.setDescription(
        `Вы купили роль ${roleMention} за ${roleShop.cost}:cookie:`
      );
    } else if (args[0] === 'add' && message.mentions.roles.size > 0) {
      if (!message.member.hasPermissions(this.managePermisions)) {
        return;
      }

      const role = message.mentions.roles.first();
      const cost = args.length > 1 ? parseInt(args[1], 10) : 0;

      await shop.set(message.guild.id, role.id, cost);

      embed.setDescription(
        `Роль **${role}** выставлена за **${cost}**:cookie:`
      );
    } else if (args[0] === 'rm' && message.mentions.roles.size > 0) {
      if (!message.member.hasPermissions(this.managePermisions)) {
        return;
      }

      const role = message.mentions.roles.first();

      await shop.remove(message.guild.id, role.id);
      embed.setDescription(`Роль **${role}** удалена из магазина`);
    } else {
      throw new CustomError(
        'Не хватает параметров, пример команды: !roles all или !roles buy @sometrash'
      );
    }

    embed.setFooter(
      tools.embedFooter(message, this.name),
      message.author.displayAvatarURL
    );
    message.channel.send(embed);
  },
};
