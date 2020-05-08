import { log } from './logger';
import { client } from './client';

import config from './config';
import handler from './events';

client
  .on('error', log.error)
  .on('warn', log.warn)
  .on('disconnect', handler.onDisconnect)
  .on('reconnecting', handler.onReconnect)
  .on('ready', handler.onReady)
  .on('guildCreate', handler.onGuildCreate)
  .on('guildBanAdd', handler.onGuildBanAdd)
  .on('guildDelete', handler.onGuildDelete)
  .on('guildMemberAdd', handler.onGuildMemberAdd)
  .on('guildMemberRemove', handler.onGuildMemberRemove)
  .on('messageUpdate', handler.onMessageUpdate)
  .on('messageDelete', handler.onMessageDelete)
  .on('messageReactionAdd', handler.onMessageReactionAdd)
  .on('messageReactionRemove', handler.onMessageReactionRemove)
  .on('voiceStateUpdate', handler.onVoiceStateUpdate)
  .on('presenceUpdate', handler.onPresenceUpdate)
  .on('message', handler.onMessage)
  .on('raw', handler.onRaw);

client.login(config.bot.token);
