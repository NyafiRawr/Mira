import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import * as bumps from '../../modules/bumps';

const body = {
  color: config.colors.message,
  author: {
    name: 'Управление наградами за бампы',
  },
};

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: body.author.name,
  usage: '[add <@> <цена> <слова> ИЛИ remove <номер>]',
  permissions: ['ADMINISTRATOR'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    const bots = await bumps.getAll(message.guild!.id);

    const embed = new MessageEmbed(body);

    if (args.length == 0) {
      embed
        .setTitle('Награждаемые боты')
        .setDescription(
          bots.length
            ? bots
                .map(
                  (bot, index) =>
                    `${index + 1}. <@${bot.botId}> - ${bot.award}:cookie: (\`${
                      bot.sentence
                    }\`)`
                )
                .join('\n')
            : 'Никого нет'
        )
        .addField(
          'Добавить/изменить или удалить',
          `\`${config.discord.prefix}${this.name} add <@> <вознаграждение> <текст сообщения об успехе>\`` +
            `\n\`${config.discord.prefix}${this.name} remove <@>\` - удалить из награждаемых`
        );
    } else {
      if (!message.member?.hasPermission(this.permissions[0])) {
        throw new Error(
          `нужно иметь глобальную привилегию ${this.permissions[0]}.`
        );
      }

      if (args[0] == 'add') {
        if (!message.mentions.members?.size) {
          throw new Error('ты никого не упомянул.');
        }

        const award = parseInt(args[2], 10);
        if (!Number.isInteger(award) || award < 1) {
          throw new Error(
            'ты не указал количество, оно должно быть целочисленным и положительным.'
          );
        }

        const sentence = args.slice(3).join(' ');
        if (sentence.length > 200) {
          throw new Error(
            `слишком много слов в ключевом тексте: ${sentence.length} из 200 символов.`
          );
        }

        const bot = message.mentions.members.first();
        await bumps.add(message.guild!.id, bot!.id, award, sentence);
        embed.setDescription(
          `${bot} в базе! Награда за бамп: ${award}:cookie:` +
            `\nВыражение для поиска: \`${sentence}\``
        );
      } else if (args[0] == 'remove') {
        const num = parseInt(args[1], 10);
        if (!Number.isInteger(num) || num < 1 || num > bots.length) {
          throw new Error('неправильно указан номер из списка.');
        }
        await bumps.remove(message.guild!.id, bots[num - 1].botId);
        embed.setDescription(
          `<@${bots[num - 1].botId}> удален из награждаемых`
        );
      } else {
        throw new Error('команда не распознана.');
      }
    }

    message.channel.send(embed);
  },
};
