import { Guild } from 'discord.js';
import { log } from '../logger';

/**
 * Обработчик при подключении нового сервера
 */
export default async (guild: Guild) => {
  log.info(
    `Отключен сервер: ${guild.name} (id: ${guild.id}). Участников: ${guild.memberCount}`
  );
};
