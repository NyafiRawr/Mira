import { Message, TextChannel } from 'discord.js';

import { log } from '../logger';
import { client, commands } from '../client';
import config from '../config';
import CustomError from '../utils/customError';
import { randomInteger } from '../utils/tools';
import * as cooldowns from '../utils/cooldowns';

export default async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  let { content } = message;

  if (
    message.mentions.users.size === 1 &&
    message.content.split(/\s+/).length === 1
  ) {
    const itSelf = message.mentions.users.first().id === client.user.id;
    content = itSelf ? `${config.bot.prefix}about` : content;
  }

  let prefixHave = false;
  for (const prefix of config.bot.prefixs) {
    if (content.startsWith(prefix)) {
      prefixHave = true;
      break;
    }
  }
  if (!prefixHave) return;

  const args = content.slice(config.bot.prefix.length).split(/ +/);

  const commandName = args.shift()!.toLowerCase();
  const command = commands.get(commandName);

  if (!command) {
    return;
  }

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
    await message.delete();
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

  log.debug('Выполнение команды', message.content);
  try {
    await command.execute(message, args, cooldowns.reset);
  } catch (err) {
    log.debug(err, message.content);

    if (err instanceof CustomError) {
      err.send(message);
    } else {
      log.error(err, message.author.id, message.content);
      throw new CustomError();
    }
  }
};
