import { Guild } from 'discord.js';
import { log } from '../logger';

/**
 * Обработчик при подключении нового сервера
 */
export default async (guild: Guild) => {
  log.info(
    `Новое подключение: ${guild.name} (id: ${guild.id}). Участники: ${guild.memberCount}`
  );
};
