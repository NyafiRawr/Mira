import { Message, MessageEmbed } from 'discord.js';
import {
  secondsFormattedHMS,
  timeLifeFormattedYMD,
  separateThousandth,
  roundDecimalPlaces,
} from '../../../utils';

const user = {
  country_code: 'RU',
  avatar_url: 'https://a.ppy.sh/8566593',
  discord_tag: 'NyafiRawr#9896',
  // playstyle: '["mouse","touch"]',
  playmode: 'osu',
  badges: '',
  groups: '',
  link: 'https://osu.ppy.sh/users/8566593',

  user_id: '8566593',
  username: 'NyafiRawr',
  join_date: '2016-06-16 11:15:35',

  count300: '917034',
  count100: '148131',
  count50: '21184',
  playcount: '6256',
  ranked_score: '3304805830',
  total_score: '5140948343',
  pp_rank: '257484',
  level: '91.2265',
  pp_raw: '1898.07',
  accuracy: '91.5190200805664',
  count_rank_ss: '69',
  count_rank_ssh: '10',
  count_rank_s: '511',
  count_rank_sh: '96',
  count_rank_a: '425',
  country: 'RU',
  total_seconds_played: '438453',
  pp_country_rank: '24033',
  events: [],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const profile = async (message: Message, args: string[]) => {
  const embed = new MessageEmbed();

  embed
    .setColor(message.member!.displayColor)
    .setAuthor(
      'Профиль на osu.ppy.sh',
      'https://cdn.discordapp.com/emojis/805790630143066132.png',
      'https://osu.ppy.sh/home'
    )
    .setTitle(
      `[Ур. ${roundDecimalPlaces(parseInt(user.level), 0)}] ${user.username}`
    )
    .setURL(user.link)
    .setDescription(
      `<:ssh:805790629324914718> ${
        user.count_rank_ssh
      }    <:ss:805790629598593054> ${
        user.count_rank_ss
      }    <:sh:805790629078499358> ${
        user.count_rank_sh
      }    <:s_:805790629220712468> ${
        user.count_rank_s
      }    <:a_:805790628758945804> ${
        user.count_rank_a
      }\n<:hit300:805819891705053244> ${separateThousandth(
        user.count300
      )}    <:hit100:805819696934027295> ${separateThousandth(
        user.count100
      )}    <:hit50:805819695785312327> ${separateThousandth(user.count50)}`
    )
    .setThumbnail(user.avatar_url || '')
    .addField('Сыграно игр', `${separateThousandth(user.playcount)} карт`, true)
    .addField(
      'Точность',
      `${roundDecimalPlaces(parseInt(user.accuracy), 2)}%`,
      true
    )
    .addField('Рейтинг в мире', `#${separateThousandth(user.pp_rank)}`, true)
    .addField(
      `Страна`,
      `:flag_${user.country_code.toLowerCase()}: #${separateThousandth(
        user.pp_country_rank
      )}`,
      true
    )
    .addField(
      'PP',
      `${separateThousandth(roundDecimalPlaces(parseInt(user.pp_raw), 0))}`,
      true
    )
    .addField(
      'Время в игре',
      secondsFormattedHMS(parseInt(user.total_seconds_played, 10)),
      true
    )
    .setFooter(
      `Аккаунту ${timeLifeFormattedYMD(new Date(user.join_date).getTime())}`
    );

  await message.channel.send(embed);
};
