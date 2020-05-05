import * as Discord from 'discord.js';
import Guild from '../models/guild';
import GuildMember from '../models/guildmember';

export const getAllGuildsServer = async (
  serverId: string
): Promise<Guild[] | null> =>
  Guild.findAll({
    where: {
      serverId
    },
  });

export const getGuildOwner = async (
  serverId: string,
  ownerId: string
): Promise<Guild | null> =>
  Guild.findOne({
    where: {
      serverId,
      ownerId
    },
  });

export const getGuildName = async (
  serverId: string,
  name: string
): Promise<Guild | null> =>
  Guild.findOne({
    where: {
      serverId,
      name
    },
  });

export const getGuildMember = async (
  serverId: string,
  userId: string
): Promise<Guild | null> => {
  const relation = await GuildMember.findOne({
    where: {
      serverId,
      userId
    },
  });
  return Guild.findOne({
    where: {
      serverId,
      id: relation!.guildId
    },
  });
};

export const getAmountMembers = async (
  serverId: string,
  guildId: string
): Promise<Guild | null> =>
  Guild.findOne({
    where: {
      serverId,
      id: guildId
    },
  });

export const addMember = async (
  serverId: string,
  userId: string,
  guildId: string
): Promise<Guild | null> =>
  Guild.create({
    serverId,
    userId,
    guildId
  });

export const removeMember = async (
  serverId: string,
  userId: string,
  guildId: string
) =>
  Guild.destroy({
    where: {
      serverId,
      userId,
      guildId
    },
  });

export const getMembersGuild = async (
  serverId: string,
  guildId: string
): Promise<GuildMember[] | null> =>
  GuildMember.findAll({
    where: {
      serverId,
      guildId
    },
  });

export const set = async (
  serverId: string,
  ownerId: string,
  fields: { [key: string]: any }
): Promise<Guild> => {
  const find = await Guild.findOne({
    where: {
      serverId,
      ownerId
    },
  });

  if (!!find) {
    return find.update(fields);
  }

  return Guild.create({
    serverId,
    ownerId,
    ...fields,
  });
};

export const remove = async (
  serverId: string,
  ownerId: string
) =>
  Guild.destroy({
    where: {
      serverId,
      ownerId
    },
  });

// Создание / проверка и воссоздание чатов
export const recreateChats = async (
  message: Discord.Message,
  guildName: string,
  categoryId: string,
  onwerId: string
): Promise<any> => {
  let guildChat;
  let guildVoice;
  let members;

  const selectGuild = await getGuildName(message.guild.id, guildName);
  if (!!selectGuild) members = await getMembersGuild(message.guild.id, selectGuild.id);

  if (!selectGuild || !message.guild.channels.get(selectGuild.chatId)) {
    guildChat = (await message.guild.createChannel(guildName, {
      type: 'text',
      permissionOverwrites: [
        {
          id: onwerId,
          allow: [
            'VIEW_CHANNEL',
            'SEND_MESSAGES',
            'MANAGE_MESSAGES',
            'MANAGE_CHANNELS'
          ],
        },
        {
          id: message.guild.defaultRole,
          deny: ['VIEW_CHANNEL'],
        },
      ],
      parent: categoryId,
    })) as Discord.TextChannel;
    if (!!selectGuild && !!members) {
      for await (const member of members) {
        guildChat.overwritePermissions(member.userId, {
          VIEW_CHANNEL: true,
        });
      }
    }
  }

  if (!selectGuild || !message.guild.channels.get(selectGuild.voiceId)) {
    guildVoice = (await message.guild.createChannel(guildName, {
      type: 'voice',
      permissionOverwrites: [
        {
          id: onwerId,
          allow: [
            'VIEW_CHANNEL',
            'CONNECT',
            'SPEAK',
            'USE_VAD',
            'MUTE_MEMBERS',
            'DEAFEN_MEMBERS',
            'MANAGE_CHANNELS'
          ],
        },
        {
          id: message.guild.defaultRole,
          deny: ['VIEW_CHANNEL'],
        },
      ],
      parent: categoryId,
    })) as Discord.VoiceChannel;
    if (!!selectGuild && !!members)
      for await (const member of members) {
        guildVoice.overwritePermissions(member.userId, {
          VIEW_CHANNEL: true,
          CONNECT: true,
          SPEAK: true,
          USE_VAD: true,
        });
      }
  }

  return { guildChat, guildVoice };
};
