import * as Discord from 'discord.js';
import * as path from 'path';
import fs from './utils/fs';

import { log } from './logger';

// Иницилизируем базу до первого обращения
import './db';

export const client = new Discord.Client();
// TODO: интерфейс команд
export const commands = new Discord.Collection<string, any>();

/**
 * Иницилизация всех команд
 * @param {String} defaultDir каталог поиска команд
 */
const loadCommands = async (defaultDir: string) => {
  // Рекурсивно обходим все дочерние папки и файлы
  // вернется список найденных файлов
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

  // Параллельно выполняем все промисы и дожидаемся их
  log.info('Загрузка команд...');
  await Promise.all(
    (await getFilePaths(defaultDir)).map(async (filePath: string) => {
      let cmd: any;
      try {
        cmd = await import(filePath);
      } catch (e) {
        log.debug(e);
        return;
      }

      commands.set(cmd.name, cmd);
      if (cmd.aliases) {
        cmd.aliases.forEach((al: any) => commands.set(al, cmd));
      }
      log.debug(`Загружена команда ${cmd.group}/${cmd.name}`);
    })
  );
  log.info('Команды загружены!');
};

loadCommands(path.join(path.resolve(__dirname), 'commands'));
