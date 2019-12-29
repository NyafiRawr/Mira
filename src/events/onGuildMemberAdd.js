import * as users from '../modules/users';

export default async (member) => {
  await users.set(member.guild.id, member.user.id, {
    firstEntry: Date.now(),
  });
};
