import Emoji from '../models/emoji';

export const get = async (channelId, messageId, emojiId) => {

  const role = await Emoji.findOne({
    where: {
      channelId,
      messageId,
      emojiId,
    },
  });
  return role;

};


export const set = async (channelId, messageId, emojiId, roleId) => {
  const role = await get(channelId, messageId, emojiId);

  if (role != null) {
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
