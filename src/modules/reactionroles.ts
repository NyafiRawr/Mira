import ReactionRole from '../models/reactionrole';
import CustomError from '../utils/customError';

export const get = async (
  serverId: string,
  channelId: string,
  messageId: string,
  emoji: string
): Promise<ReactionRole | null> => {
  // findOne меняет кодировку, как следствие сравнение неправильное
  const database = await ReactionRole.findAll({
    where: {
      serverId,
      channelId,
      messageId,
    },
  });
  for (const rr of database) {
    if (rr.emoji === emoji) {
      return rr;
    }
  }
  return null;
};

export const getServer = async (
  serverId: string
): Promise<ReactionRole[] | null> =>
  ReactionRole.findAll({
    where: {
      serverId,
    },
  });

export const set = async (
  serverId: string,
  channelId: string,
  messageId: string,
  emoji: string,
  roleId: string
): Promise<ReactionRole> => {
  const role = await get(serverId, channelId, messageId, emoji);

  if (role !== null) {
    return role.update({
      roleId,
    });
  }

  return ReactionRole.create({
    serverId,
    channelId,
    messageId,
    emoji,
    roleId,
  });
};

export const remove = async (
  serverId: string,
  channelId: string,
  messageId: string,
  emoji: string
): Promise<void> => {
  const role = await get(serverId, channelId, messageId, emoji);

  if (role !== null) {
    return role.destroy();
  }

  throw new CustomError(
    `выдача S: \`${serverId}\` C: \`${channelId}\` M: \`${messageId}\` E: \`${emoji}\` не найдена, удаление невозможно.`
  );
};
