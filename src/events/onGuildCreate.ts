import { Guild } from 'discord.js';
import { log } from '../logger';

/**
 * Обработчик при подключении нового сервера
 */
export default async (guild: Guild) => {
  log.info(
    `Меня добавили в: ${guild.name} (id: ${guild.id}). Участники: ${guild.memberCount}`
  );
};
