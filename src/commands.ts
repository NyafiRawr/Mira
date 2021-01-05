import { Collection, Message } from 'discord.js';
import cooldowns from './cooldowns';
import config from './config';
import { log } from './logger';
import { randomInteger, secondsFormattedHMS } from './utils';

export interface CommandFile {
  cooldown: {
    messages: string[] | undefined;
    seconds: number | undefined;
  };
  name: string;
  description: string;
  aliases: string[] | undefined;
  usage: string | undefined;
  group: string;
  execute(message?: Message, args?: string[]): void | Promise<void>;
}

// Подключение команд
const commandsPaths = [
  __dirname + '/commands/Разработка/ping',
  __dirname + '/commands/Разработка/donate',
  __dirname + '/commands/Разработка/info',
  __dirname + '/commands/Разработка/help',
  __dirname + '/commands/Разработка/invite',

  __dirname + '/commands/Экономика/work',
  __dirname + '/commands/Экономика/top',
  __dirname + '/commands/Экономика/co',
  __dirname + '/commands/Экономика/give',
  __dirname + '/commands/Экономика/shop',

  __dirname + '/commands/Игры/box',
  __dirname + '/commands/Игры/guess',
  __dirname + '/commands/Игры/roll',
  __dirname + '/commands/Игры/dice',
  __dirname + '/commands/Игры/coin',

  __dirname + '/commands/Модерация/bump',
  __dirname + '/commands/Модерация/embed',
  __dirname + '/commands/Модерация/gco',
  __dirname + '/commands/Модерация/rco',
  __dirname + '/commands/Модерация/eval',
  __dirname + '/commands/Модерация/air',
  __dirname + '/commands/Модерация/purge',
  __dirname + '/commands/Модерация/say',
  __dirname + '/commands/Модерация/rr',

  __dirname + '/commands/Общение/g',
  __dirname + '/commands/Общение/ava',
  __dirname + '/commands/Общение/bday',
  __dirname + '/commands/Общение/ems',
  __dirname + '/commands/Общение/rep',
  __dirname + '/commands/Общение/server',
  __dirname + '/commands/Общение/user',
];

export const commandsList = new Collection<string, CommandFile>();
export const commandsAliases = new Collection<string, CommandFile>();
(async () => {
  // Рекурсивно обходим все файлы команд из подключаемого списка
  commandsPaths.map(async (filePath: string) => {
    const cmd = await import(filePath);
    commandsList.set(cmd.name, cmd);
    if (cmd.aliases) {
      cmd.aliases.forEach((aliase: string) => commandsAliases.set(aliase, cmd));
    }
    log.info(`Загружена команда ${cmd.group}/${cmd.name}`);
  });
})();

export const commands = async (message: Message): Promise<void> => {
  // Игнорируем ботов и ЛС
  if (message.author.bot || !message.guild) {
    return;
  }

  // Даём информацию о себе по упоминанию
  if (
    message.client.user &&
    message.mentions.users.has(message.client.user.id) &&
    message.content.length <= message.client.user.id.length + 5 // "<@!ID> " - восклицательного знака и пробела может не быть
  ) {
    commandsList.get('info')?.execute(message);
    return;
  }

  // Проверяем, что наш префикс использовали
  if (!message.content.startsWith(config.discord.prefix)) {
    return;
  }

  // Извлекаем аргументы
  const args = message.content.slice(config.discord.prefix.length).split(' ');
  // Ищем команду в нашем списке
  const commandName = args.shift()!.toLowerCase();
  const command =
    commandsList.get(commandName) || commandsAliases.get(commandName);
  if (command == undefined) {
    return;
  }

  // Проверяем не в откате ли эта команда и, если да, то сообщаем
  const timeLeft = cooldowns.get(
    message.guild.id,
    message.author.id,
    command.name
  );
  if (timeLeft) {
    // Если есть уникальные сообщения в команде об откате, то показываем одно из них
    const formattedTimeLeft = secondsFormattedHMS(timeLeft);
    if (command.cooldown?.messages) {
      message.reply(
        command.cooldown.messages[
          randomInteger(0, command.cooldown.messages.length - 1)
        ].replace('timeLeft', formattedTimeLeft)
      );
    } else {
      message.reply(
        `пожалуйста, подожди ${formattedTimeLeft} прежде, чем вызвать команду: ${command.name}!`
      );
    }
    return;
  }

  // Обновление отката
  cooldowns.set(
    message.guild.id,
    message.author.id,
    command.name,
    command.cooldown?.seconds || config.defaultCooldown.seconds
  );

  try {
    // Выполнение команды
    await command.execute(message, args);
  } catch (e) {
    cooldowns.set(message.guild.id, message.author.id, command.name, 3); // Сброс отката при любой ошибке
    if (e instanceof Error) {
      message.reply(e.message);
    } else {
      message.reply(
        'при выполнении команды произошла непредвиденная ошибка, попробуйте вызывать команду ещё раз или сообщите об этом Няфи.'
      );
      log.error(e);
      return;
    }
  }
};
