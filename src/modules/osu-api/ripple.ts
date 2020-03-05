import axios from 'axios';
import * as tools from '../../utils/tools';
import { calculateAccuracy } from '../osu';
import CustomError from '../../utils/customError';

const responseFail = (error: string) => {
  return `ошибка в обмене информацией: \`${error}\``;
};

export const getUser = async (
  server: string,
  nickname: string,
  mode: string
): Promise<{ [key: string]: any } | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const response = await axios.get('/api/v1/users/full', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      name: nickname,
    },
  });
  if (response.status !== 200) {
    throw new CustomError(
      responseFail(response.data?.error || response.statusText)
    );
  }
  const { data } = response;
  if (!data || !Object.keys(data).length) {
    throw new CustomError(
      `игрок \`${nickname}\` не найден на сервере \`${server}\` в режиме \`${mode}\``
    );
  }

  const modeName = tools.getDataValueOnKey('osu!/modes', mode).aliases[0];
  const gameUser = {
    user_id: data.id,
    username: data.username,
    join_date: data.registered_on,
    total_hits: data[modeName].total_hits,
    playcount: data[modeName].playcount,
    ranked_score: data[modeName].ranked_score,
    total_score: data[modeName].total_score,
    pp_rank: data[modeName].global_leaderboard_rank,
    level: data[modeName].level,
    pp_raw: data[modeName].pp,
    accuracy: data[modeName].accuracy,
    count_rank_ss: null,
    count_rank_ssh: null,
    count_rank_s: null,
    count_rank_sh: null,
    count_rank_a: null,
    country: data.country,
    total_seconds_played: data[modeName].playtime,
    pp_country_rank: data[modeName].country_leaderboard_rank,
  };

  return gameUser;
};

export const getBeatmap = async (
  server: string,
  idBeatmap: string,
  mode: string
): Promise<{ [key: string]: any } | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const response = await axios.get('/api/get_beatmaps', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      b: idBeatmap,
      m: mode,
    },
  });
  if (response.status !== 200) {
    throw new CustomError(
      responseFail(response.data?.error || response.statusText)
    );
  }
  const { data } = response;
  if (!data || !data.length) {
    throw new CustomError(`карта \`${idBeatmap}\` не найдена.`);
  }

  const diff = data[0];
  const difficulty = {
    approved: diff.approved,
    submit_date: null,
    approved_date: diff.approved_date,
    last_update: diff.last_update,
    artist: diff.artist,
    beatmap_id: diff.beatmap_id,
    beatmapset_id: diff.beatmapset_id,
    bpm: diff.bpm,
    creator: diff.creator,
    creator_id: null,
    difficultyrating: diff.difficultyrating,
    diff_aim: null,
    diff_speed: null,
    diff_size: diff.diff_size,
    diff_overall: diff.diff_overall,
    diff_approach: diff.diff_approach,
    diff_drain: diff.diff_drain,
    hit_length: diff.hit_length,
    source: diff.source,
    genre_id: diff.genre_id,
    language_id: diff.language_id,
    title: diff.title,
    total_length: diff.total_length,
    version: diff.version,
    file_md5: diff.file_md5,
    mode: diff.mode,
    tags: diff.tags,
    favourite_count: diff.favourite_count,
    rating: null,
    playcount: diff.playcount,
    passcount: diff.passcount,
    count_normal: null,
    count_slider: null,
    count_spinner: null,
    max_combo: diff.max_combo,
    download_unavailable: null,
    audio_unavailable: null,
  };

  return difficulty;
};

export const getUserRecents = async (
  server: string,
  nickname: string,
  limit: number,
  mode: string
): Promise<{ [key: string]: any }[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const osuUser = await getUser(server, nickname, mode);
  const response = await axios.get('/api/v1/users/scores/recent', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode,
      l: limit,
      name: nickname,
    },
  });
  if (response.status !== 200) {
    throw new CustomError(
      responseFail(response.data?.error || response.statusText)
    );
  }
  const { scores } = response.data;
  if (!scores || !scores.length) {
    throw new CustomError(
      `игрок \`${nickname}\` последнее время ничего не играл на \`${server}\` в режиме \`${mode}\`.`
    );
  }

  const recents: { [key: string]: any }[] = [];
  for (const recent of scores)
    recents.push({
      beatmap_id: recent.beatmap.beatmap_id,
      score: recent.score,
      maxcombo: recent.max_combo,
      count50: recent.count_50,
      count100: recent.count_100,
      count300: recent.count_300,
      countmiss: recent.count_miss,
      countkatu: recent.count_katu,
      countgeki: recent.count_geki,
      perfect: recent.full_combo,
      enabled_mods: recent.mods,
      user_id: osuUser!.user_id,
      date: recent.time,
      rank: recent.rank,
      beatmap: await getBeatmap(server, recent.beatmap.beatmap_id, mode),
      pp: recent.pp,
      accuracy: recent.accuracy,
    });

  return recents;
};

export const getUserTops = async (
  server: string,
  nickname: string,
  limit: number,
  mode: string
): Promise<{ [key: string]: any }[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const osuUser = await getUser(server, nickname, mode);
  const response = await axios.get('/api/v1/users/scores/best', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode,
      l: limit,
      id: parseInt(osuUser!.user_id, 10), // Без парсинга не работает!
    },
  });
  if (response.status !== 200) {
    throw new CustomError(
      responseFail(response.data?.error || response.statusText)
    );
  }
  const { scores } = response.data;
  if (!scores || !scores.length) {
    throw new CustomError(
      `у игрока \`${nickname}\` на \`${server}\` нет результатов.`
    );
  }

  const bests: { [key: string]: any }[] = [];
  for (const best of scores)
    bests.push({
      beatmap_id: best.beatmap.beatmap_id,
      score_id: best.id,
      score: best.score,
      maxcombo: best.max_combo,
      count50: best.count_50,
      count100: best.count_100,
      count300: best.count_300,
      countmiss: best.count_miss,
      countkatu: best.count_katu,
      countgeki: best.count_geki,
      perfect: best.full_combo,
      enabled_mods: best.mods,
      user_id: osuUser!.user_id,
      date: best.time,
      rank: best.rank,
      pp: best.pp,
      replay_available: null,
      beatmap: await getBeatmap(server, best.beatmap.beatmap_id, mode),
      accuracy: best.accuracy,
    });

  return bests;
};

export const getScores = async (
  server: string,
  nickname: string,
  idBeatmap: string,
  limit: number,
  mode: string
): Promise<{ [key: string]: any } | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const response = await axios.get('/api/get_scores', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode,
      b: idBeatmap,
      l: limit,
      u: nickname, // "u:"" принимает и id и name, но если "id:" то выкидывает левых людей с нужным челом
    },
  });
  if (response.status !== 200) {
    throw new CustomError(responseFail(response.statusText));
  }
  const scores = response.data;
  if (!scores || !scores.length) {
    throw new CustomError(
      `нет результата на \`${idBeatmap}\` от игрока \`${nickname}\` на \`${server}\` в режиме \`${mode}\`.`
    );
  }

  const scoresOnBeatmap: { [key: string]: any }[] = [];
  for (const score of scores)
    scoresOnBeatmap.push({
      score_id: score.id,
      score: score.score,
      username: score.user_id,
      count300: score.count_300,
      count100: score.count_100,
      count50: score.count_50,
      countmiss: score.count_miss,
      maxcombo: score.maxcombo,
      countkatu: score.count_katu,
      countgeki: score.count_geki,
      perfect: score.full_combo,
      enabled_mods: score.mods,
      user_id: score.user_id,
      date: score.time,
      rank: score.rank,
      pp: score.pp,
      replay_available: null,
      accuracy: String(
        calculateAccuracy(
          mode,
          score.count300,
          score.count100,
          score.count50,
          score.countmiss,
          score.countkatu,
          score.countgeki
        )
      ),
      beatmap: await getBeatmap(server, idBeatmap, mode),
    });

  return scoresOnBeatmap;
};
