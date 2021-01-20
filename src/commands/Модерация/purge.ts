import { Message } from 'discord.js';
import { isInteger } from 'lodash';

module.exports = {
  name: __filename.slice(__dirname.length + 1).split('.')[0],
  description: 'Удаление сообщений',
  aliases: ['remove', 'clear', 'prune', 'delete'],
  usage: '<кол-во> [@писатель]',
  cooldown: {
    seconds: 3,
  },
  permissions: ['MANAGE_MESSAGES'],
  group: __dirname.split(/[\\/]/)[__dirname.split(/[\\/]/).length - 1],
  async execute(message: Message, args: string[]) {
    const channel = message.guild!.channels.resolve(message.channel.id);

    if (!channel?.permissionsFor(message.member!)?.has(this.permissions[0])) {
      throw new Error('у тебя нет права управлять сообщениями в этом канале!');
    }
    if (
      !channel?.permissionsFor(message.client.user!)!.has(this.permissions[0])
    ) {
      throw new Error('у меня нет права управлять сообщениями в этом канале!');
    }

    const arg = args.shift();
    if (arg === undefined) {
      throw new Error('не указано количество удаляемых сообщений.');
    }

    const amount = parseInt(arg, 10);
    if (isInteger(amount) == false) {
      throw new Error('количество должно быть целочисленным и положительным.');
    }
    if (amount < 1 && amount > 100) {
      throw new Error(
        'минимум 1 и не более 100 сообщений для удаления за раз.'
      );
    }

    if (message.mentions.users.size === 0 && message.channel.type === 'text') {
      const messages = await message.channel.bulkDelete(amount, true);
      await (
        await message.channel.send(
          `Удалено сообщений: **${messages.size}**, ${message.author}\nЭтот отчёт скоро исчезнет :alarm_clock:`
        )
      ).delete({ timeout: 3000 });
    } else {
      let messages = await message.channel.messages.fetch({ limit: amount });

      const user = message.mentions.users.first();
      if (user) {
        messages = messages.filter((msg) => msg.author.id == user.id);
      }

      const reportMessage = await message.channel.send(
        `Удаление **${messages.size}** сообщений(я), ${message.author}\nЭто сообщение будет удалено по заврешению :alarm_clock:`
      );

      for await (const [, msg] of messages) {
        await msg.delete({ reason: 'Purge' });
      }

      await reportMessage.delete({ timeout: 1000 });
    }
  },
};
