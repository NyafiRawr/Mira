import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as shop from '../../modules/shop';
import * as economy from '../../modules/economy';
import * as tools from '../../utils/tools';
import * as menu from '../../utils/menu';
import * as emojiCharacters from '../../utils/emojiCharacters';
import * as cooldowns from '../../utils/cooldowns';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Магазин ролей',
  aliases: undefined,
  usage: '[add/rem <@роль>] [цена для витрины]',
  guild: true,
  hide: false,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  cooldown: 30,
  cooldownMessage: [
    'ты наверное самая быстрая рука на диком западе? Я не успеваю убрать и снова выставить товары!',
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

    if (!args.length) {
      const roles = await shop.getAll(message.guild.id);
      if (!roles.length) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('в магазине ничего нет!');
      }
      const member = message.guild.member(message.author.id);
      roles.forEach(async (role: any, id: number) => {
        const roleName = message.guild.roles.get(role.roleId);
        if (!roleName) {
          await shop.remove(message.guild.id, role.roleId);
        } else {
          if (member.roles.has(role.roleId)) {
            embed.addField(
              `**№${id + 1}: ~~${role.cost}~~**:cookie:`,
              `~~**${roleName}**~~`,
              true
            );
          } else {
            embed.addField(
              `**№${id + 1}: ${role.cost}**:cookie:`,
              `**${roleName}**`,
              true
            );
          }
        }
      });

      const embedMessage = (await message.channel.send(embed)) as Discord.Message;
      const readyBuy = await menu.waitReaction(
        embedMessage,
        [emojiCharacters.words.cookie],
        message.author.id
      );
      if (!readyBuy) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        if (!readyBuy) return;
      }

      const processBuy: any = await message.reply(
        'а теперь напиши в чат номер роли которую ты хочешь купить!'
      );
      const indexBuy = await menu.waitMessage(
        message.channel,
        message.author.id
      );
      if (!indexBuy) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        if (indexBuy === undefined)
          throw new CustomError('ты не указал роль для покупки, отмена.');
      }
      const index = parseInt(indexBuy, 10);
      if (isNaN(index))
        throw new CustomError('номер указан с ошибкой, попробуй ещё раз.');
      const idBuy = index - 1;
      if (idBuy > roles.length || idBuy < 0)
        throw new CustomError('выход за пределы диапазона.');
      if (message.guild.member(message.author.id).roles.has(roles[idBuy].roleId)) {
        throw new CustomError('у тебя уже есть эта роль!');
      }
      const roleBuy = message.guild.roles.get(roles[idBuy].roleId) as Discord.Role;
      if (roleBuy.position >= message.guild.me.highestRole.position) {
        throw new CustomError('не могу выдать роль, которая выше или равна моей наивысшей!');
      }
      await economy.pay(message.guild.id, message.author.id, roles[idBuy].cost);
      await message.member.addRole(roleBuy);
      return processBuy.edit(
        `${message.author}, роль **${roleBuy.name}** уже на тебе!`
      );
    }

    if (args[0] === 'add') {
      if (!message.member.hasPermissions(this.permisions[0])) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('нужно иметь право управлять ролями.');
      }
      const role = message.mentions.roles.first();
      if (!role) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('не указана роль для продажи.');
      }
      const cost = args.length === 3 ? parseInt(args[2], 10) : 0;
      if (isNaN(cost) || cost < 0) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('неправильно указана цена.');
      }
      const shopList = await shop.getAll(message.guild.id);
      if (shopList.length > 24) {
        // Максимум дискорда: 25
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('на витрину больше не влезает :(');
      }
      await shop.set(message.guild.id, role.id, cost);
      embed.setDescription(
        `Роль **${role}** выставлена за **${cost}**:cookie:`
      );
      await cooldowns.reset(message.guild.id, message.author.id, this.name);
      return message.channel.send(embed);
    }

    if (args[0] === 'rem') {
      if (!message.member.hasPermissions(this.permisions[0])) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('нужно иметь право управлять ролями.');
      }
      const role = message.mentions.roles.first();
      if (!role) {
        await cooldowns.reset(message.guild.id, message.author.id, this.name);
        throw new CustomError('не указана роль для удаления.');
      }
      await shop.remove(message.guild.id, role.id);
      embed.setDescription(`Роль **${role}** удалена из магазина :(`);
      await cooldowns.reset(message.guild.id, message.author.id, this.name);
      return message.channel.send(embed);
    }
  },
};
