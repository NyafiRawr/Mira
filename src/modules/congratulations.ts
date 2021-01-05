import { client } from '../client';
import { log } from '../logger';
import User from '../models/User';
import config from '../config';
import { Op } from 'sequelize';

const timeout = 24 * 60 * 60 * 1000;

export const happyBirthday = async () => {
  log.info('[Happy Birthday] Ищу именинников...');

  const users = await User.findAll({
    where: { birthday: { [Op.eq]: Date.now() } },
  });

  users.map((user: User) => {
    const guild = client.guilds.resolve(user.serverId);
    const member = guild?.members.resolve(user.userId);
    if (member) {
      log.info(
        `[Happy Birthday] Поздравляю ${member.displayName} с днём рождения!`
      );

      const age =
        new Date(
          Date.now() - new Date(user.birthday!).getTime()
        ).getFullYear() - 1970;
      let ageString = `${age}`;
      if (age % 10 == 1 && age != 11) {
        ageString += ` год`;
      } else if (age > 1 && age < 5) {
        ageString += ` года`;
      } else {
        ageString += ` лет`;
      }

      member
        .send({
          embed: {
            color: config.colors.alert,
            title: 'С днём рождения!',
            image: {
              url:
                'https://media1.tenor.com/images/9509d670db26a9eacc317b751a3fbb38/tenor.gif',
            },
            footer: {
              text: `${member.displayName} исполнилось ${ageString}!`,
            },
          },
        })
        .catch(/* ЛС ЗАКРЫТО ИЛИ МЫ ЗАБЛОКИРОВАНЫ */);
    }
  });

  log.info('[Happy Birthday] На сегодня обход завершен');

  setTimeout(async () => {
    await happyBirthday();
  }, timeout);
};
