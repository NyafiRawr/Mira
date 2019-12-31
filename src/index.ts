import client from './client';

import config from './config';
import handler from './events';

client
  .on('error', console.error)
  .on('warn', console.warn)

  .on('disconnect', handler.onDisconnect)
  .on('reconnecting', handler.onReconnect)
  .on('ready', handler.onReady)
  .on('guildCreate', handler.onGuildCreate)
  .on('guildDelete', handler.onGuildDelete)
  .on('guildMemberAdd', handler.onGuildMemberAdd)
  .on('messageReactionAdd', handler.onMessageReactionAdd)
  .on('messageReactionRemove', handler.onMessageReactionRemove)

  .on('message', handler.onMessage);

client.login(config.bot.token);
