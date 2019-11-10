import Discord from 'discord.js';
import path from 'path';

import fs from './modules/fs';
import config from './config';
import { randomInteger, logError } from './modules/tools';

import './modules/db';

import * as users from './modules/users';

import * as cooldowns from './modules/kv';

const client = new Discord.Client();
client.commands = new Discord.Collection();

async function CooldownReset(idServer, idUser, commandName) {
  await cooldowns.reset(idServer, idUser, commandName);
}

// Инициализация команд
const loadCommands = async (defaultDir) => {
  const getFilePaths = async (dir) => {
    let files = await fs.readdir(dir);
    files = await Promise.all(files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) return getFilePaths(filePath);
      if (stats.isFile()) return filePath;
    }));

    return files.reduce((all, folderContents) => all.concat(folderContents), []);
  };

  console.log('------ Загрузка команд ------');
  await Promise.all(
    (await getFilePaths(defaultDir)).map(async (item) => {
      try {
        const cmd = await import(item);
        client.commands.set(cmd.name, cmd);
        if (cmd.aliases) cmd.aliases.forEach((al) => client.commands.set(al, cmd));
        console.log(`   ${config.bot.prefix}${cmd.name} - ${cmd.description}`);
      } catch (err) {
        console.warn(`Ошибка импорта: ${item}`);
        logError(err);
        return null;
      }
    }),
  );
  console.log('----------------------------');
};

loadCommands(
  path.join(path.resolve(__dirname), 'commands'),
);

// Регистрация добавления реакций
const events = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
};

// Регистрация событий
client.on('raw', async (event) => {
  // eslint-disable-next-line no-prototype-builtins
  if (!events.hasOwnProperty(event.t)) {
    return;
  }

  const {
    d: data,
  } = event;
  const user = client.users.get(data.user_id);
  const channel = client.channels.get(data.channel_id) || await user.createDM();

  if (channel.messages.has(data.message_id)) {
    return;
  }

  const message = await channel.fetchMessage(data.message_id);

  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  const reaction = message.reactions.get(emojiKey);

  client.emit(events[event.t], reaction, user);
});

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('disconnect', () => {
    console.warn('Обрыв связи!');
  })
  .on('reconnecting', () => {
    console.warn('Переподключение.');
  })
  .on('ready', async () => {
    console.log(`* ${client.user.tag} на связи! Подключения: ${client.guilds.size} Всего пользователей: ${client.users.size}`);
    console.log('Подключенные сервера:');
    client.guilds
      .forEach((g) => console.log(' ', g.name));
    console.log('----------------------------');

    client.user.setActivity(`${config.bot.prefix}help`);
  })
  .on('guildCreate', (guild) => {
    console.log(`Новое подключение: ${guild.name} (id: ${guild.id}). Участники: ${guild.memberCount}`);
  })
  .on('guildDelete', (guild) => {
    console.log(`Отключение от: ${guild.name} (id: ${guild.id})`);
  })
  .on('guildMemberAdd', async (member) => {
    await users.set(member.guild.id, member.user.id, {
      firstEntry: Date.now(),
    });
  })
  .on('guildMemberRemove', async (member) => {
    // todo: лог событий
  })
  .on('message', async (message) => {
    if (message.author.bot) {
      return;
    }

    let { content } = message;

    if (message.mentions.members.size === 1 && message.content.split(/ +/).length === 1) {
      if (message.mentions.members.first().id === client.user.id) {
        content = `${config.bot.prefix}about`;
      }
    }

    let prefix;

    // todo: работы с несколькими префиксами
    if (content.startsWith(config.bot.prefix)) {
      prefix = config.bot.prefix;
    }

    if (!prefix) return;

    const args = message.content.slice(prefix.length).split(/ +/);

    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {
      return;
    }

    if (message.guild && !message.channel.permissionsFor(message.client.user).has('SEND_MESSAGES')) {
      return message.author
        .send(`${message.author}, нет разрешения отправлять сообщения в ${message.channel} на сервере **${message.guild}**!`)
        .catch(console.error);
    }

    if (message.channel.type === 'text') {
      // todo: переписать, не очень так делать
      setTimeout(() => message.delete().catch(console.error), 500);
    } else if (command.guild) {
      return message.reply('эта команда недоступна в ЛС!');
    }

    const timeLeft = await cooldowns.get(message.guild.id, message.author.id, command.name);

    if (!timeLeft) {
      const cooldown = command.cooldown || 3;
      cooldowns.set(message.guild.id, message.author.id, command.name, cooldown);
    } else {
      if (!command.cooldownMessage) {
        return message.reply(`пожалуйста, подождите ${timeLeft} прежде, чем снова вызвать команду: ${command.name}!`);
      }

      return message.reply(command.cooldownMessage[randomInteger(0, command.cooldownMessage.length - 1)].replace('leftTime', timeLeft));
    }

    try {
      await command.execute(message, args, CooldownReset);
    } catch (error) {
      console.error(error);
      logError(error);
      message.reply('при вызове команды произошла ошибка ;(');
    }
  });

client.login(config.bot.token);
