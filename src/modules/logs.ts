import {
  Guild,
  User,
  Message,
  PartialMessage,
  Collection,
  GuildMember,
  PartialGuildMember,
} from 'discord.js';

export const logKick = async (member: GuildMember | PartialGuildMember) => {
  // if (vars.logs.enabled === false) { return; }

  // Последняя запись в журнале аудита должна быть логом о кике
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: 'MEMBER_KICK',
  });

  const kickLog = fetchedLogs.entries.first();
  if (!kickLog) {
    console.log('kick log not found');
    return; // Случай когда за последнее время киков не было совсем
  }

  const { executor, target, reason } = kickLog;

  // Проверяем, что лог создан не больше 5 секунд назад
  // 1 вар: kickLog.createdAt < member.joinedAt, но:
  // "joinedAt может быть null, если данные о пользователе не получены"
  // 2 вар: Date.now() - kickLog.createdTimestamp > 5000
  if (member.joinedAt !== null && kickLog.createdAt < member.joinedAt) {
    return; // Случай когда нам попался старый лог о кике
  }

  const kickMember = target as User;
  if (kickMember.id === member.id) {
    console.log(
      `${member.user?.tag} left the guild; kicked by ${executor.tag}? Reason: ${reason}`
    );
  } else {
    console.log('not a member');
    return; // Случай когда мы всё же ошиблись, возможно логов за 5 секунд было слишком много
  }
};

export const logBanAdd = async (guild: Guild, user: User) => {
  const ban = await guild.fetchBan(user);
  console.log(
    `User ${user.tag} [ID: ${user.id}] banned with reason: ${ban.reason}`
  );
};

export const logBanRemove = async (guild: Guild, user: User) => {
  console.log(`User ${user.tag} [ID: ${user.id}] unbanned.`);
};

export const logMessageDelete = async (message: Message | PartialMessage) => {
  if (message.guild === null) {
    return; // Игнорируем ЛС
  }

  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: 'MESSAGE_DELETE',
  });

  const deletionLog = fetchedLogs.entries.first();
  if (deletionLog !== undefined) {
    const { executor, target } = deletionLog;

    const deletionMember = target as User;
    if (deletionMember.id === message.author?.id) {
      return console.log(
        `A message by ${message.author.tag} was deleted by ${executor.tag}.`
      );
    }
  }

  console.log(
    `A message: "${message}" Attachs: ${message.attachments.size} was deleted self.`
  );
};

export const logMessageBulk = async (
  messages: Collection<string, Message | PartialMessage>
) => {
  console.log(`Bulk deleted ${messages.size} messages.`);
  messages.map((message, index) => {
    console.log(`Message ${index} content: ${message}.`);
  });
};

export const logMessageUpdate = async (
  messageOld: Message | PartialMessage,
  messageNew: Message | PartialMessage
) => {
  if (messageOld.partial) {
    messageOld = await messageOld.channel.messages.fetch(messageOld.id);
  }
  console.log(
    `Message ${messageOld.content} update ${messageNew.content} by ${messageOld.author?.username}`
  );
};
