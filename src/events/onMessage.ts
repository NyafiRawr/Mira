import { Message } from 'discord.js';

import { log } from '../logger';
import { client, commands } from '../client';
import config from '../config';
import CustomError from '../utils/customError';
import { randomInteger } from '../utils/tools';
import * as cooldowns from '../utils/cooldowns';
import * as warns from '../modules/warnings';

export default async (message: Message) => {
  if (message.author.bot) return;

  let { content } = message;

  // Mention me?
  if (
    message.mentions.users.size === 1 &&
    message.content.split(/\s+/).length === 1
  ) {
    const itSelf = message.mentions.users.first().id === client.user.id;
    content = itSelf ? `${config.bot.prefix}about` : content;
  }

  if ( // Check prefix
    !config.bot.prefixs.filter((prefix) => content.startsWith(prefix)).length
  ) { // Bad-words checking
    const badChannelsIds = await warns.getBadChannelsIds(message.guild.id);
    if (!badChannelsIds.includes(message.channel.id)) {
      const badWords = await warns.getBadWords(message.guild.id);
      const arrayContent = content.split(' ');
      for (const word of badWords) {
        if (arrayContent.includes(word)) {
          await message.delete().catch();
          const reason = 'Использование запрещенных слов';
          await warns.set(message.guild.id, message.member.id, reason);
          await message.channel.send(warns.msg(message.member, reason)).catch();
          break;
        }
      }
    }
    return;
  }

  const args = content.slice(config.bot.prefix.length).split(/ +/);

  const commandName = args.shift()!.toLowerCase();
  const command = commands.get(commandName);

  if (!command) return;

  const channel = message.guild.channels.find('id', message.channel.id);
  if (
    message.guild &&
    !channel.permissionsFor(message.client.user)!.has('SEND_MESSAGES')
  ) {
    return message.author
      .send(
        `${message.author}, нет права отправлять сообщения в ${message.channel} на сервере **${message.guild}**!`
      )
      .catch(); // ЛС закрыто, вот и пусть гадает в чём проблема ;)
  }

  if (message.channel.type === 'text') {
    await message.delete().catch();
  } else if (command.guild) {
    return message.reply(`команда \`${command.name}\` недоступна в ЛС!`);
  }

  const timeLeft = await cooldowns.get(
    (message.guild || message.author).id,
    message.author.id,
    command.name
  );

  if (!timeLeft) {
    const cooldown = command.cooldown || 3;
    cooldowns.set(
      (message.guild || message.author).id,
      message.author.id,
      command.name,
      cooldown
    );
  } else {
    let reply;

    if (!command.cooldownMessage) {
      reply = `пожалуйста, подождите ${timeLeft} прежде, чем вызвать команду: ${command.name}!`;
    } else {
      reply = command.cooldownMessage[
        randomInteger(0, command.cooldownMessage.length - 1)
      ].replace('leftTime', timeLeft);
    }

    return message.reply(reply);
  }

  try {
    await command.execute(message, args, cooldowns.reset);
  } catch (err) {
    log.debug('Выполнение команды', message.content);
    log.debug(err, message.content);

    if (err instanceof CustomError) {
      err.send(message);
    } else {
      log.error(err, message.author.id, message.content);
      throw new CustomError();
    }
  }
};
