import { Message, MessageEmbed } from 'discord.js';
import * as economy from '../../modules/economy';
import * as shops from '../../modules/shops';
import config from '../../config';
import { separateThousandth } from '../../utils';

const body = {
  color: config.colors.message,
  title: 'Магазин ролей',
  description: 'Ничего нет',
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Магазин ролей',
  aliases: ['magaz', 'magazin', 'magazine'],
  usage: '[номер ИЛИ add <@роль> <цена> ИЛИ rem <номер>]',
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  cooldown: {
    seconds: 3,
    messages: ['я не успеваю убирать и выставлять товары! (timeLeft)'],
  },
  permissions: ['MANAGE_ROLES'],
  async execute(message: Message, args: string[]) {
    const roles = await shops.getAll(message.guild!.id);

    const embed = new MessageEmbed(body);

    // .shop
    if (args.length == 0) {
      // Магазин пуст ИНАЧЕ показываем витрину
      if (roles.length < 1) {
        embed.setFooter(
          `${config.discord.prefix}${this.name} add <@роль> <цена> | ${config.discord.prefix}${this.name} rem <номер>`
        );
      } else {
        embed
          .setDescription(
            roles
              .map(
                (role, index) =>
                  `${index + 1}. <@&${role.roleId}> - ${separateThousandth(
                    role.cost.toString()
                  )}:cookie:`
              )
              .join('\n')
          )
          .setFooter(
            `Купить/продать: ${config.discord.prefix}${this.name} [номер] | Можно носить только одну`
          );
      }
    } else {
      // .shop args[0] ...
      if (args[0] == 'add') {
        if (!message.member?.hasPermission(this.permissions[0])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[0]}.`
          );
        }

        if (!message.mentions.roles.size) {
          throw new Error('не упомянута роль для выставления на продажу.');
        }

        const cost = parseInt(args[2], 10);
        if (!Number.isInteger(cost) || cost < 0) {
          throw new Error(
            'неправильно указана или не указана цена, если нужно выставить бесплатную роль, укажите в цене ноль.'
          );
        }

        const role = message.mentions.roles.first();
        await shops.add(message.guild!.id, role!.id, cost);
        embed.setDescription(`**${role}** выставлена за **${cost}**:cookie:`);
      } else if (args[0] == 'rem') {
        if (!message.member?.hasPermission(this.permissions[0])) {
          throw new Error(
            `нужно иметь глобальную привилегию ${this.permissions[0]}.`
          );
        }

        const num = parseInt(args[1], 10);
        if (!Number.isInteger(num) || num < 1 || num > roles.length) {
          throw new Error('неправильно указан номер с витрины.');
        }

        await shops.remove(message.guild!.id, roles[num - 1].roleId);
        embed.setDescription(
          `Роль, которая была под номером ${num}, удалена из магазина`
        );
      } else {
        // Купить/продать роль по номеру
        const num = parseInt(args[0], 10);
        if (!Number.isInteger(num) || num < 1 || num > roles.length) {
          throw new Error('неправильно указан номер с витрины.');
        }

        const isRemove = message.member!.roles.cache.has(roles[num - 1].roleId);

        if (isRemove === false) {
          const haveShopRole = roles.some((role) =>
            message.member!.roles.cache.has(role.roleId)
          );
          if (haveShopRole) {
            throw new Error('можно иметь только одну роль из магазина.');
          }
        }

        try {
          if (isRemove) {
            await message.member!.roles.remove(roles[num - 1].roleId);
          } else {
            await message.member!.roles.add(roles[num - 1].roleId);
          }
        } catch (e) {
          throw new Error(
            'ошибка. Возможные причины:' +
              '\n- У меня нет прав управлять ролями' +
              '\n- Роль выше или равна моей наивысшей' +
              '\n- Роль создана ботом - управление такими ролями невозможно'
          );
        }

        if (isRemove) {
          const partOfFunds = Math.round((roles[num - 1].cost * 70) / 100); // 70%
          await economy.setBalance(
            message.guild!.id,
            message.author.id,
            partOfFunds
          );
          embed
            .setDescription(`Роль <@&${roles[num - 1].roleId}> продана!`)
            .setFooter(
              `Тебе возвращено ${separateThousandth(
                partOfFunds.toString()
              )} печенек (70%)`
            );
        } else {
          await economy.setBalance(
            message.guild!.id,
            message.author.id,
            -roles[num - 1].cost
          );
          embed.setDescription(`Роль <@&${roles[num - 1].roleId}> на тебе!`);
        }
      }
    }

    message.channel.send(embed);
  },
};
