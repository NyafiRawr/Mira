// eslint-disable-next-line no-unused-vars
import * as Discord from 'discord.js';

/**
 * Своя реализация ошибки с возможностью пробросить ответ для конечного пользователя
 */
export default class CustomError extends Error {
  private reply: string | null;

  constructor(msg?: string) {
    super(msg);

    // на случай когда не указали ответ
    this.reply = msg || null;
  }

  /**
   * Вызывается для отправки сообщения пользователю
   * @param {Discord.Message} message сообщение
   * @returns {Promise<void>}
   */
  public async send(message: Discord.Message): Promise<Discord.Message | Discord.Message[]> {
    return message.reply(this.reply || 'при вызове команды произошла ошибка ;(');
  }
}
