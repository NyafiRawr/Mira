import CustomError from '../../utils/customError';
import * as Discord from 'discord.js';
import * as tools from '../../utils/tools';
import * as menu from '../../utils/menu';
import * as players from '../../modules/players';
import * as emojiCharacters from '../../utils/emojiCharacters';

const servers = tools.getData('osu!/servers');
const modes = tools.getData('osu!/modes');

const users: string[] = [];

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Привязать аккаунт osu!',
  aliases: undefined,
  usage: undefined,
  guild: true,
  cooldown: 3,
  cooldownMessage: undefined,
  permissions: undefined,
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message) {
    if (message.author.id in users) {
      throw new CustomError('команда уже вызвана!');
    }
    users.push(message.author.id);

    const embed = new Discord.RichEmbed()
      .setAuthor('Настройка аккаунта osu!')
      .setTitle('Меню')
      .setDescription(`${emojiCharacters.numbers[1]} Добавить/Изменить\n${emojiCharacters.numbers[2]} Удалить`)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );
    let embedMessage = (await message.channel.send(message.author, {
      embed,
    })) as Discord.Message;
    const change = await menu.waitReaction(
      embedMessage,
      [emojiCharacters.numbers[1], emojiCharacters.numbers[2]],
      message.author.id
    );
    if (change === null) {
      await embedMessage.clearReactions();
      users.splice(users.indexOf(message.author.id), 1);
      throw new CustomError('вы ничего не выбрали, отмена.');
    }
    switch (change) {
      case '0': {
        embed.setTitle('Добавить/Изменить');
        // Выбор игрового сервера
        let changeServer = '**Выбери игровой сервер:**\n';
        for (let i = 0; i < Object.keys(servers).length; i += 1) {
          changeServer += `${emojiCharacters.numbers[i + 1]} ${
            Object.values<any>(servers)[i].name
            }\n`;
        }
        embed.setDescription(changeServer);
        embedMessage = await embedMessage.edit(message.author, { embed });
        const osuServerIndex = await menu.waitReaction(
          embedMessage,
          Object.values(emojiCharacters.numbers).slice(1, Object.keys(servers).length + 1),
          message.author.id
        );
        if (osuServerIndex === null) {
          await embedMessage.clearReactions();
          users.splice(users.indexOf(message.author.id), 1);
          throw new CustomError('не выбран сервер, отмена.');
        }
        // Выбор играемых режимов
        let changeMode = '**Выбери играемые режимы:**\n';
        for (let i = 0; i < Object.keys(modes).length; i += 1) {
          changeMode += `${emojiCharacters.numbers[i + 1]} ${
            Object.values<any>(modes)[i].name
            }\n`;
        }
        embed.setDescription(changeMode);
        embedMessage = await embedMessage.edit(message.author, { embed });
        const osuModesIndexes = await menu.waitReactionComplete(
          embedMessage,
          Object.values(emojiCharacters.numbers).slice(1, Object.keys(modes).length + 1),
          emojiCharacters.words.complete,
          message.author.id
        );
        await embedMessage.clearReactions();
        if (osuModesIndexes === null) {
          users.splice(users.indexOf(message.author.id), 1);
          throw new CustomError('не выбран ни один режим, отмена.');
        }
        // Запись ника и запись в базу
        embed.setDescription('Напиши никнейм...');
        await embedMessage.edit(message.author, { embed });
        const osuName = await menu.waitMessage(
          message.channel,
          message.author.id
        );
        if (osuName === null) {
          users.splice(users.indexOf(message.author.id), 1);
          throw new CustomError('не указан ник, отмена.');
        }
        embed.setTitle('Успех!');
        embed.setDescription(`Игрок **${osuName}** на сервере **${
          Object.values<any>(servers)[osuServerIndex as any].name
          }**
         играет **${osuModesIndexes
            .map(mode => modes[mode].name)
            .join(', ')}**!`);
        await embedMessage.edit(message.author, { embed });
        await players.set(
          message.author.id,
          Object.keys(servers)[osuServerIndex as any],
          {
            modes: osuModesIndexes.join(','),
            nickname: osuName,
          }
        );
        break;
      }
      case '1': {
        embed.setTitle('Удалить');
        const listServersPlayer = await players.getAll(message.author.id);
        if (listServersPlayer == null || listServersPlayer.length === 0) {
          embed.setDescription('Нет привязанных аккаунтов для удаления');
          embedMessage.edit(message.author, { embed });
          return embedMessage.clearReactions();
        }
        // Выбор игрового сервера
        let changeServer = '**Выбери сервер к которому привязан аккаунт:**\n';
        for (let i = 0; i < listServersPlayer.length; i += 1) {
          changeServer += `${emojiCharacters.numbers[i + 1]} ${
            servers[listServersPlayer[i].gameServer].name
            }\n`;
        }
        embed.setDescription(changeServer);
        embedMessage = await embedMessage.edit(message.author, { embed });
        const osuServerIndex = await menu.waitReaction(
          embedMessage,
          Object.values(emojiCharacters.numbers).slice(1, listServersPlayer.length + 1),
          message.author.id
        );
        await embedMessage.clearReactions();
        if (osuServerIndex === null) {
          users.splice(users.indexOf(message.author.id), 1);
          throw new CustomError('не выбран сервер для отвязки, отмена.');
        }

        const idx = parseInt(osuServerIndex || '0', 10);
        await players
          .remove(message.author.id, listServersPlayer[idx].gameServer)
          .then(() => {
            embed.setTitle('Удалено');
            embed.setDescription(
              `Аккаунт **${listServersPlayer[idx].nickname}** при сервере **${
              servers[listServersPlayer[idx].gameServer].name
              }** отвязан`
            );
            embedMessage.edit(message.author, { embed });
          });
        break;
      }
      default:
    }
  },
};
