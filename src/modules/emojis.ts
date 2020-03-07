import Emoji from '../models/emoji';
import CustomError from '../utils/customError';

export const get = async (
  serverId: string,
  channelId: string,
  messageId: string,
  emojiId: string
): Promise<Emoji | null> => {
  // findOne меняет кодировку, как следствие сравнение неправильное
  const allEmojis = await Emoji.findAll({
    where: {
      serverId,
      channelId,
      messageId,
    },
  });
  for (const emoji of allEmojis) {
    if (emoji.emojiId === emojiId) {
      return emoji;
    }
  }
  return null;
};

export const getServer = async (
  serverId: string
): Promise<Emoji[] | null> => Emoji.findAll({
  where: {
    serverId
  },
});

export const set = async (
  serverId: string,
  channelId: string,
  messageId: string,
  emojiId: string,
  roleId: string
): Promise<Emoji> => {
  const role = await get(serverId, channelId, messageId, emojiId);

  if (role !== null) {
    return role.update({
      roleId,
    });
  }

  return Emoji.create({
    serverId,
    channelId,
    messageId,
    emojiId,
    roleId,
  });
};

export const remove = async (
  serverId: string,
  channelId: string,
  messageId: string,
  emojiId: string,
): Promise<void> => {
  const role = await get(serverId, channelId, messageId, emojiId);

  if (role !== null) {
    return role.destroy();
  }

  throw new CustomError(
    `выдача S: \`${serverId}\` C: \`${channelId}\` M: \`${messageId}\` E: \`${emojiId}\` не найдена, удаление невозможно.`
  );
};
