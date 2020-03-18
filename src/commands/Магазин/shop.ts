import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as shop from '../../modules/shop';
import * as economy from '../../modules/economy';
import * as tools from '../../utils/tools';
import * as menu from '../../utils/menu';
import * as emojiCharacters from '../../utils/emojiCharacters';
import * as cooldowns from '../../utils/cooldowns';
import { Identifier } from 'sequelize/types';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Магазин ролей (купить/~~продать~~)',
  aliases: undefined,
  usage: '[add/rem <@роль>] [цена для витрины]',
  guild: true,
  hide: false,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  cooldown: 30,
  cooldownMessage: [
    'ты наверное самая быстрая рука на диком западе? Я не успеваю убрать и снова выставить товары! (leftTime)',
  ],
  permisions: ['MANAGE_ROLES'],
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed()
      .setAuthor(this.description, message.guild.splashURL || message.guild.iconURL)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    const role = message.mentions.roles.first();
    if (args[0] === 'add' || args[0] === 'rem') {
      if (!message.member.hasPermissions(this.permisions[0])) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('нужно иметь право управлять ролями.');
      }
      if (!role) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('обязательно нужно указать роль.');
      }
    }

    if (args[0] === 'add') {
      // Цена
      const cost = args.length === 3 ? parseInt(args[2], 10) : 0;
      if (isNaN(cost) || cost < 0) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('неправильно указана цена.');
      }
      // Вместимость витрины
      const shopList = await shop.getAll(message.guild.id);
      if (shopList.length >= 25) { // Максимум дискорда: 25
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('на витрину больше не влезает :(');
      }
      // Добавление и отчёт
      await shop.set(message.guild.id, role.id, cost);
      embed.setDescription(
        `Роль **${role}** выставлена за **${cost}**:cookie:`
      );
      await cooldowns.reset(message.guild.id, message.author.id, this.name);
      return message.channel.send(embed);
    } else if (args[0] === 'rem') {
      await shop.remove(message.guild.id, role.id);
      embed.setDescription(`Роль **${role}** удалена из магазина (если она там была)`);
      await cooldowns.reset(message.guild.id, message.author.id, this.name);
      return message.channel.send(embed);
    } else if (!args.length) {
      const shopRoles = await shop.getAll(message.guild.id);

      if (shopRoles.length < 1) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('в магазине ничего нет!');
      }

      const sellRoles = new Map(); // Можно иметь только одну роль из списка
      const member = message.guild.member(message.author.id);
      shopRoles.forEach(async (shopRole: any, i: number) => {
        const roleName = message.guild.roles.get(shopRole.roleId);
        if (!roleName) {
          await shop.remove(message.guild.id, shopRole.roleId);
        } else {
          if (member.roles.has(shopRole.roleId)) {
            sellRoles.set(i, shopRole.roleId);
            embed.addField(`**№${i + 1}: ${shopRole.cost}**:cookie:`,
              `~~**${roleName}**~~`, true);
          } else {
            embed.addField(`**№${i + 1}: ${shopRole.cost}**:cookie:`,
              `**${roleName}**`, true);
          }
        }
      });

      const embedMessage = (await message.channel.send(embed)) as Discord.Message;
      const pressCookie = await menu.waitReaction(
        embedMessage,
        [emojiCharacters.words.cookie],
        message.author.id
      );
      if (!pressCookie) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        if (!pressCookie) return;
      }

      const messageWaitAct: any = await message.reply(
        'а теперь напиши в чат номер роли которую ты хочешь купить или продать!'
      );
      const indexAct = await menu.waitMessage(
        message.channel,
        message.author.id
      );
      if (!indexAct) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        if (indexAct === undefined)
          throw new CustomError('ты не указал роль, отмена.');
      }

      const index = parseInt(indexAct, 10);
      if (isNaN(index)) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('номер указан с ошибкой, попробуй ещё раз.');
      }

      const id = index - 1;
      if (id < 0 || id > shopRoles.length) {
        throw new CustomError('выход за пределы диапазона.');
      }

      const roleAct = message.guild.roles.get(shopRoles[id].roleId) as Discord.Role;

      if (roleAct.position >= message.guild.me.highestRole.position) {
        await shop.remove(message.guild.id, shopRoles[id].roleId);
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError(
          'не могу выдать/снять роль, которая выше или равна моей наивысшей, роль удалена из магазина!'
        );
      }

      if (message.guild.member(message.author.id).roles.has(shopRoles[id].roleId)) {
        await economy.set(message.guild.id, message.author.id, shopRoles[id].cost);
        await message.member.removeRole(roleAct);
        messageWaitAct.edit('так как у тебя уже есть эта роль, то она была продана!');
      } else {
        await economy.pay(message.guild.id, message.author.id, shopRoles[id].cost);
        await message.member.addRole(roleAct);

        if (sellRoles.size) {
          sellRoles.forEach(async (sellRoleId: any, i: number) => {
            await message.member.removeRole(sellRoleId);
            await economy.set(message.guild.id, message.author.id, shopRoles[i].cost);
          });
        }

        messageWaitAct.edit(`${message.author}, роль **${roleAct.name}** на тебе!`);
      }

      return cooldowns.reset(message.guild.id, message.author.id, this.name);
    } else {
      await cooldowns.reset(message.guild.id, message.author.id, this.name);
      throw new CustomError('ошибка в параметрах, попробуй ещё раз.');
    }
  },
};
