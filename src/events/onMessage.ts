import { Message, TextChannel } from 'discord.js';

import { log } from '../logger';
import { client, commands } from '../client';
import config from '../config';
import CustomError from '../utils/customError';
import { randomInteger } from '../utils/tools';
import * as cooldowns from '../utils/kv';

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

  let prefix;

  // todo: работы с несколькими префиксами
  if (content.startsWith(config.bot.prefix)) {
    prefix = config.bot.prefix;
  }

  if (!prefix) {
    return;
  }

  const args = content.slice(prefix.length).split(/ +/);

  const commandName = args.shift()!.toLowerCase();
  const command = commands.get(commandName);

  if (!command) {
    return;
  }

  // if (message.guild && !message.channel.permissionsFor(message.client.user).has('SEND_MESSAGES')) {
  //   return message.author
  //     .send(`${message.author}, нет разрешения отправлять сообщения в ${message.channel} на сервере **${message.guild}**!`)
  //     .catch(console.error);
  // }

  if (message.channel.type === 'text') {
    await message.delete();
  } else if (command.guild) {
    return message.reply('эта команда недоступна в ЛС!');
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
      reply = `пожалуйста, подождите ${timeLeft} прежде, чем снова вызвать команду: ${command.name}!`;
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
      message.reply('при вызове команды произошла ошибка ;(');
    }
  }
};
