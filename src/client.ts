import * as Discord from 'discord.js';
import * as path from 'path';
import fs from './utils/fs';

import { log } from './logger';
import config from './config';

// иницилизирует базу до того как запустится бот
// иначе она иницилизируется только при первом обращении из команд
import './utils/db';

export const client = new Discord.Client();
// todo: интерфейс команд
export const commands = new Discord.Collection<string, any>();

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
  log.info('Загрузка команд');
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
  log.info('Команды загружены');
};

// не ждем загрузки всех команд для
// того что бы бот появился в сети как можно быстрее
loadCommands(path.join(path.resolve(__dirname), 'commands'));
