import * as Discord from 'discord.js';

/**
 * Своя реализация ошибки с возможностью пробросить ответ для конечного пользователя
 */
export default class CustomError extends Error {
  private reply: string | null;

  constructor(reason?: string) {
    super(reason);

    // Случай когда не указан ответ
    this.reply = reason || null;
  }

  /**
   * Вызывается для отправки сообщения пользователю
   * @param {Discord.Message} message сообщение
   * @returns {Promise<void>}
   */
  public async send(
    message: Discord.Message
  ): Promise<Discord.Message | Discord.Message[]> {
    return message.reply(
      this.reply || 'при вызове команды произошла сложная ошибка нужно чинить ;('
    ).catch();
  }
}
