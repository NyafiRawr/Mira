import * as Discord from 'discord.js';
import CustomError from '../../utils/customError';
import * as economy from '../../modules/economy';
import * as voices from '../../modules/voices';
import * as tools from '../../utils/tools';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Свой временный голосовой канал',
  aliases: ['v'],
  usage: '[create <название> / invite/kick <@упоминание, @...>] ',
  guild: true,
  hide: false,
  cooldown: 1,
  cooldownMessage: undefined,
  permisions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Discord.Message, args: string[]) {
    const embed = new Discord.RichEmbed()
      .setAuthor(this.description, message.guild.iconURL)
      .setColor(tools.randomHexColor())
      .setFooter(
        tools.embedFooter(message, this.name),
        message.author.displayAvatarURL
      );

    const settings = await voices.getSettings(message.guild.id);
    const price = settings?.price || 0;

    if (args.length === 0) {
      embed
        .setTitle('Доступные команды')
        .setDescription(
          `**${this.aliases[0]} create** [своё название голосового чата]`
          + `\n**${this.aliases[0]} invite/kick** <@>, @...`
          + `\n\n**Цена:** ${price}:cookie:`
        );
      return message.channel.send(embed);
    }

    let tempVoice;
    const idVoice = await voices.getVoiceId(message.guild.id, message.author.id);
    if (!!idVoice) {
      tempVoice = message.guild.channels.get(idVoice);
      if (!tempVoice) {
        await voices.deleteVoiceId(message.guild.id, message.author.id);
        throw new CustomError('ошибка, у тебя должен быть голосовой канал, но он не найден, запись о существовании удалена, попробуй снова!');
      }
    }

    if (args[0] === 'create') {
      if (settings === null || !settings.categoryId || !message.guild.channels.get(settings.categoryId)) {
        throw new CustomError(
          `категория для размещения не найдена, попроси админов сделать это командой \`${this.aliases[0]} cat <id-категории>\`!`
        );
      }

      if (!!tempVoice) {
        throw new CustomError('у тебя уже есть канал!');
      }

      await economy.pay(
        message.guild.id,
        message.author.id,
        price
      );

      const voiceName = args[1] || message.member.displayName;
      const newTempVoice = (await message.guild.createChannel(voiceName, {
        type: 'voice',
        permissionOverwrites: [
          {
            id: message.member.id,
            allow: [
              'VIEW_CHANNEL',
              'CONNECT',
              'SPEAK',
              'USE_VAD',
              'MUTE_MEMBERS',
              'DEAFEN_MEMBERS',
            ],
          },
          {
            id: message.guild.defaultRole,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        parent: settings.categoryId,
      })) as Discord.VoiceChannel;

      const invite = await newTempVoice.createInvite({
        maxAge: 10 * 60,
        temporary: true,
      }, `Приглашение в **${newTempVoice}**`);
      await voices.setVoiceId(message.guild.id, message.author.id, newTempVoice.id);
      await message.reply(
        `канал __**${newTempVoice}**__ создан! ${invite.url}`
      );

      const deleteChannel = () => {
        voices.deleteVoiceId(message.guild.id, message.author.id);
        newTempVoice
          .delete()
          .then(() => message.reply(`пустующий канал __${newTempVoice}__ удалён!`))
          .catch();
      };

      return setTimeout(() => {
        const watcher = setInterval(
          () =>
            newTempVoice.members.size === 0 &&
            deleteChannel() &&
            clearInterval(watcher),
          2e4
        );
      }, 1e4);
    }

    if (args[0] === 'invite') {
      if (!tempVoice) {
        throw new CustomError('у тебя нет канала, чтобы приглашать кого-либо в него.');
      }

      if (args.length <= 1) {
        throw new CustomError('необходимо указать кому хочешь дать доступ в канал.');
      }

      for await (const target of message.mentions.members.array()) {
        tempVoice.overwritePermissions(target.id, {
          VIEW_CHANNEL: true,
          CONNECT: true,
          SPEAK: true,
          USE_VAD: true,
        });
      }

      const invite = await tempVoice.createInvite({
        maxAge: 10 * 60
      });

      await message.reply(
        `**${message.mentions.members.array().join(', ')}** добавлен(ы) в **${tempVoice}**. **Вход: ${invite.url}**`
      );

      return;
    }

    if (args[0] === 'kick') {
      if (!tempVoice) {
        throw new CustomError('у тебя нет канала, чтобы исключать кого-нибудь из него.');
      }

      if (args.length <= 1) {
        throw new CustomError('необходимо указать кому нужно закрыть доступ в канал!');
      }

      for await (const target of message.mentions.members.array()) {
        tempVoice.replacePermissionOverwrites({
          overwrites: tempVoice.permissionOverwrites.filter(
            perm => perm.id !== target.id
          ),
        });

        if (target.voiceChannel === tempVoice) {
          target.setVoiceChannel(null);
        }
      }

      await message.reply(`**${message.mentions.members.array().join(', ')}** исключен(ы) из **${tempVoice}**`);

      return;
    }

    if (args[0] === 'cat') {
      if (!message.member.hasPermissions(this.permisions[0])) {
        throw new CustomError('нужно иметь право администрировать сервер, чтобы менять категорию создания каналов.');
      }

      if (args.length <= 1) {
        throw new CustomError('необходимо указать ID категория для размещения!');
      }

      const newCategoryId = args[1];
      const newCategory = message.guild.channels.get(newCategoryId);
      if (!newCategory) {
        throw new CustomError('неправильный идентификатор, категория не найден!');
      }
      await voices.setSettings(message.guild.id, { categoryId: newCategoryId });

      return message.reply(`установленная категория размещения каналов: ${newCategory}`);
    }

    if (args[0] === 'price') {
      if (!message.member.hasPermissions(this.permisions[0])) {
        throw new CustomError('нужно иметь право администрировать сервер, чтобы менять цену канала.');
      }

      if (args.length <= 1) {
        throw new CustomError('необходимо указать новую цену канала!');
      }

      const newPrice = parseInt(args[1], 10);
      if (isNaN(newPrice) || newPrice < 0) {
        throw new CustomError('неправильно указана цена.');
      }
      await voices.setSettings(message.guild.id, { price: newPrice });

      return message.reply(`новая цена за канал: ${newPrice}:cookie:`);
    }
  },
};
