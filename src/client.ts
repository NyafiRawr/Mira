import * as Discord from 'discord.js';
import * as path from 'path';
import fs from './modules/fs';

import config from './config';

// иницилизирует базу до того как запустится бот
// иначе она иницилизируется только при первом обращении из команд
import './modules/db';

const client = new Discord.Client();
// fixme: нельзя так делать
(client as any).commands = new Discord.Collection();

/**
 * Иницилизация всех команд
 * @param {String} defaultDir папка в которой будут искаться команды
 */
const loadCommands = async (defaultDir: string) => {
  // рекурсивно обходим все дочерние папки и файлы
  // вернется список файлов которые были найдены
  const getFilePaths = async (dir: string) => {
    let files = await fs.readdir(dir);
    files = await Promise.all<any>(
      files.map(async (file: string) => {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          return getFilePaths(filePath);
        }
        if (stats.isFile()) {
          return filePath;
        }
      })
    );

    return files.reduce(
      (all: any, folderContents: any) => all.concat(folderContents),
      []
    );
  };

  // параллельно выполняем все промисы и дожидаемся их
  console.log('------ Загрузка команд ------');
  const res = await Promise.all(
    (await getFilePaths(defaultDir)).map(async (filePath: string) => import(filePath))
  );

  res.forEach((cmd: any) => {
    (client as any).commands.set(cmd.name, cmd);
    if (cmd.aliases) {
      cmd.aliases.forEach((al: any) => (client as any).commands.set(al, cmd));
    }
    console.log(`   ${config.bot.prefix}${cmd.name} - ${cmd.description}`);
  });
  console.log('----------------------------');
};

// не ждем загрузки всех команд для
// того что бы бот появился в сети как можно быстрее
loadCommands(path.join(path.resolve(__dirname), 'commands'));

export default client;
