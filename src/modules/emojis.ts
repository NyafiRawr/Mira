import Emoji from '../models/emoji';

export const get = async (
  channelId: string,
  messageId: string,
  emojiId: string
): Promise<Emoji | null> => {
  // findOne меняет кодировку, как следствие сравнение неправильное
  const allEmojis = await Emoji.findAll({
    where: {
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

export const set = async (
  channelId: string,
  messageId: string,
  emojiId: string,
  roleId: string
): Promise<Emoji> => {
  const role = await get(channelId, messageId, emojiId);

  if (role !== null) {
    return role.update({
      roleId,
    });
  }

  return Emoji.create({
    channelId,
    messageId,
    emojiId,
    roleId,
  });
};
