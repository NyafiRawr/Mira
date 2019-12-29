import Discord from 'discord.js';
import path from 'path';
import fs from './modules/fs';

import config from './config';
import { logError } from './modules/tools';

// int database
import './modules/db';

export const commands = new Discord.Collection();

// Инициализация команд
export const loadCommands = async (defaultDir) => {
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
        commands.set(cmd.name, cmd);
        if (cmd.aliases) cmd.aliases.forEach((al) => commands.set(al, cmd));
        console.log(`   ${config.bot.prefix}${cmd.name} - ${cmd.description}`);
      } catch (err) {
        console.error(err);
        logError(err, `Ошибка импорта: ${item}`);
        return null;
      }
    }),
  );
  console.log('----------------------------');
};


loadCommands(
  path.join(path.resolve(__dirname), 'commands'),
);
