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
