import { client } from './client';
import config from './config';
import { log } from './logger';
import { commands } from './commands';
import { awardOfBump } from './modules/bumps';
import { onAirInPresence, onAirInVoice } from './modules/airs';
import { happyBirthday } from './modules/congratulations';
import { writeVoiceTime, rewriteVoiceTime } from './modules/voicetimes';
import { reactionRoleAdd, reactionRoleRemove } from './modules/rrs';
import { checkBadWords, checkJail, returnMuteRole } from './modules/mutes';
import {
  clearDeadTempChannels,
  checkEntryInTempVoiceCreater,
} from './modules/tempvoices';
import {
  logBanAdd,
  logBanRemove,
  logKick,
  logMessageBulk,
  logMessageDelete,
  logMessageUpdate,
} from './modules/logs';
import * as users from './modules/users';

client.on('disconnect', () => log.error('Соединение оборвалось!'));

client.on('warn', log.warn);

client.on('guildCreate', (guild) =>
  log.info(
    `Меня добавили в: ${guild.name} [GID: ${guild.id}]. Владелец: ${guild.owner}. Участники: ${guild.memberCount}`
  )
);

client.on('guildDelete', (guild) =>
  log.info(
    `Меня удалили из: ${guild.name} [GID: ${guild.id}]. Владелец: ${guild.owner}. Участники: ${guild.memberCount}`
  )
);

// Один раз при запуске
client.once('ready', async () => {
  await client.user?.setPresence({
    activity: {
      name: `${config.discord.prefix}help`,
      type: 'WATCHING',
    },
    status: 'online',
  });

  await happyBirthday();
  await checkJail();
});

// При каждом восстановлении соединения
client.on('ready', async () => {
  log.info(`Бот ${client.user?.tag} на связи!`);

  await rewriteVoiceTime();
  await clearDeadTempChannels();
});

client.on('message', async (message) => {
  await commands(message);
  await awardOfBump(message);
  await checkBadWords(message);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  await onAirInVoice(oldState, newState);
  await writeVoiceTime(oldState, newState);
  await checkEntryInTempVoiceCreater(oldState, newState);
});

client.on(
  'presenceUpdate',
  async (oldPresence, newPresence) =>
    await onAirInPresence(oldPresence, newPresence)
);

client.on('messageReactionAdd', async (messageReaction, user) => {
  await reactionRoleAdd(messageReaction, user);
});

client.on('messageReactionRemove', async (messageReaction, user) => {
  await reactionRoleRemove(messageReaction, user);
});

client.on('guildMemberAdd', async (guildMember) => {
  await users.get(guildMember.guild.id, guildMember.user.id); // Записываем время входа
  await returnMuteRole(guildMember);
});

client.on('guildMemberRemove', async (guildMember) => {
  await logKick(guildMember);
});

client.on('guildBanAdd', async (guild, user) => await logBanAdd(guild, user));

client.on(
  'guildBanRemove',
  async (guild, user) => await logBanRemove(guild, user)
);

client.on('messageDelete', async (message) => await logMessageDelete(message));

client.on(
  'messageDeleteBulk',
  async (message) => await logMessageBulk(message)
);

client.on(
  'messageUpdate',
  async (messageOld, messageNew) =>
    await logMessageUpdate(messageOld, messageNew)
);

client.login(config.discord.token);
