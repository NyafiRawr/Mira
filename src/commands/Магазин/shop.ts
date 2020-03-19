import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as shop from '../../modules/shop';
import * as economy from '../../modules/economy';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Магазин ролей',
  aliases: undefined,
  usage: '[номер] / [add/rem <@роль> [цена для витрины]]',
  guild: true,
  hide: false,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  cooldown: 1,
  cooldownMessage: [
    'ты наверное самая быстрая рука на диком западе? Я не успеваю убрать и снова выставить товары! (leftTime)',
  ],
  permisions: ['MANAGE_ROLES'],
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed()
      .setAuthor(this.description, message.guild.splashURL || message.guild.iconURL)
      .setDescription(`Купить/продать: ${this.name} <номер>. Можно иметь только одну роль!`)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    // Добавление / удаление
    if (args[0] === 'add' || args[0] === 'rem') {
      if (!message.member.hasPermissions(this.permisions[0])) {
        throw new CustomError('нужно иметь право управлять ролями.');
      }
      if (!message.guild.me.hasPermissions(this.permisions[0])) {
        throw new CustomError('у меня нет права управлять ролями.');
      }
      const role = message.mentions.roles.first();
      if (!role) {
        throw new CustomError('обязательно нужно указать роль.');
      }

      // Добавление
      if (args[0] === 'add') {
        // Цена
        const cost = args.length === 3 ? parseInt(args[2], 10) : 0;
        if (isNaN(cost) || cost < 0) {
          throw new CustomError('неправильно указана цена.');
        }
        // Вместимость витрины
        const shopList = await shop.getAll(message.guild.id);
        if (shopList.length >= 25) { // Максимум дискорда: 25
          throw new CustomError('на витрину больше не влезает :(');
        }
        // Добавление и отчёт
        await shop.set(message.guild.id, role.id, cost);
        embed.setDescription(
          `Роль **${role}** выставлена за **${cost}**:cookie:`
        );
        return message.channel.send(embed);
      }

      // Удаление
      if (args[0] === 'rem') {
        await shop.remove(message.guild.id, role.id);
        embed.setDescription(`Роль **${role}** удалена из магазина (если она там была)`);
        return message.channel.send(embed);
      }
    } else { // Если не удаление и не добавление
      const shopRoles = await shop.getAll(message.guild.id);

      if (shopRoles.length < 1) {
        throw new CustomError('в магазине ничего нет!');
      }

      if (args.length === 0) { // Показать витрину
        shopRoles.forEach(async (shopRole: any, i: number) => {
          const roleName = message.guild.roles.get(shopRole.roleId);
          if (!roleName) {
            await shop.remove(message.guild.id, shopRole.roleId);
          } else {
            if (message.member.roles.has(shopRole.roleId)) {
              embed.addField(`**№${i + 1}: ${shopRole.cost}**:cookie:`,
                `~~**${roleName}**~~`, true);
            } else {
              embed.addField(`**№${i + 1}: ${shopRole.cost}**:cookie:`,
                `**${roleName}**`, true);
            }
          }
        });

        await message.channel.send(embed);
      } else { // Купить роль по номеру
        const num = parseInt(args[0], 10);

        if (isNaN(num)) {
          throw new CustomError('номер указан с ошибкой, попробуй ещё раз.');
        }

        const index = num - 1;
        if (index < 0 || index > shopRoles.length) {
          throw new CustomError('такого номера нет.');
        }

        const roleAct = message.guild.roles.get(shopRoles[index].roleId) as Discord.Role;

        if (roleAct.position >= message.guild.me.highestRole.position) {
          await shop.remove(message.guild.id, shopRoles[index].roleId);
          throw new CustomError(
            'не могу выдать/снять роль, которая выше или равна моей наивысшей, роль удалена из магазина!'
          );
        }

        if (message.member.roles.has(shopRoles[index].roleId)) {
          await economy.set(message.guild.id, message.author.id, shopRoles[index].cost);
          await message.member.removeRole(roleAct);
          message.reply('так как у тебя уже есть эта роль, то она была продана!');
        } else {
          await economy.pay(message.guild.id, message.author.id, shopRoles[index].cost);

          // Можно иметь только одну роль из списка
          shopRoles.forEach(async (shopRole: any) => {
            const roleName = message.guild.roles.get(shopRole.roleId);
            if (!roleName) {
              await shop.remove(message.guild.id, shopRole.roleId);
            }
            if (message.member.roles.has(shopRole.roleId)) {
              await economy.set(message.guild.id, message.author.id, shopRole.cost);
              await message.member.removeRole(shopRole.roleId);
            }
          });

          await message.member.addRole(roleAct);

          message.reply(`роль **${roleAct.name}** на тебе!`);
        }
      }
    }
  },
};
