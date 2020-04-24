import axios from 'axios';
import * as tools from '../../utils/tools';
import CustomError from '../../utils/customerror';

const responseFail = (error: string) => {
  return `ошибка в обмене информацией: \`${error}\``;
};

export const getUser = async (
  server: string,
  nickname: string,
  mode: string
): Promise<{ [key: string]: any } | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const responseInfo = await axios.get('/users/get', {
    baseURL: `https://${configServer.api.url}`,
    params: {
      u: nickname,
    },
  });
  const responseStats = await axios.get('/user/stats', {
    baseURL: `https://${configServer.api.url}`,
    params: {
      mode,
      u: nickname,
    },
  });
  if (responseStats.status !== 200 || responseStats.data.code !== 200) {
    throw new CustomError(
      responseFail(responseStats.data?.error || responseStats.statusText)
    );
  }
  if (responseInfo.status !== 200 || responseInfo.data.code !== 200) {
    throw new CustomError(
      responseFail(responseInfo.data?.error || responseInfo.statusText)
    );
  }
  const dataInfos = responseInfo.data.users;
  const dataStats = responseStats.data.stats;
  if (!dataInfos!.length || !dataStats || !Object.keys(dataStats).length) {
    throw new CustomError(
      `игрок \`${nickname}\` не найден на сервере \`${server}\` в режиме \`${mode}\``
    );
  }
  const dataInfo = dataInfos[0];

  const gameUser = {
    user_id: dataStats.id,
    username: dataInfo.username,
    join_date: dataInfo.registered_on,
    total_hits: dataStats.total_hits,
    playcount: dataStats.playcount,
    ranked_score: dataStats.ranked_score,
    total_score: dataStats.total_score,
    pp_rank: dataStats.rank,
    level: dataStats.level + dataStats.level_progress / 100,
    pp_raw: dataStats.pp,
    accuracy: dataStats.avg_accuracy,
    count_rank_ss: dataStats.x_count,
    count_rank_ssh: dataStats.xh_count,
    count_rank_s: dataStats.s_count,
    count_rank_sh: dataStats.sh_count,
    count_rank_a: dataStats.a_count,
    country: dataInfo.country,
    total_seconds_played: dataStats.playtime,
    pp_country_rank: dataStats.country_rank,
  };

  return gameUser;
};

export const getBeatmap = async (
  server: string,
  idBeatmap: string,
  mode: string
): Promise<{ [key: string]: any } | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const response = await axios.get('/beatmaps/get', {
    baseURL: `https://${configServer.api.url}`,
    params: {
      bb: idBeatmap,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    throw new CustomError(
      responseFail(response.data?.error || response.statusText)
    );
  }
  const { data } = response.data;
  if (!data || !data.length) {
    throw new CustomError(`карта \`${idBeatmap}\` не найдена.`);
  }

  const diff = data[0];
  const difficulty = {
    approved: diff.ranked,
    submit_date: null,
    approved_date: tools.unixToDate(diff.ranking_data),
    last_update: null,
    artist: diff.artist,
    beatmap_id: diff.beatmap_id,
    beatmapset_id: diff.beatmapset_id,
    bpm: diff.bpm,
    creator: null,
    creator_id: null,
    difficultyrating: [
      diff.difficulty_std,
      diff.difficulty_taiko,
      diff.difficulty_ctb,
      diff.difficulty_mania,
    ][parseInt(mode, 10)],
    diff_aim: null,
    diff_speed: diff.bpm,
    diff_size: diff.cs,
    diff_overall: diff.od,
    diff_approach: diff.ar,
    diff_drain: diff.hp,
    hit_length: diff.hit_length,
    source: null,
    genre_id: null,
    language_id: null,
    title: diff.title,
    total_length: diff.total_length,
    version: diff.version,
    file_md5: null,
    mode: diff.mode,
    tags: null,
    favourite_count: null,
    rating: diff.rating,
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
  const response = await axios.get('/user/scores/recent', {
    baseURL: `https://${configServer.api.url}`,
    params: {
      mode,
      l: limit,
      f: 1, // Only on gatari: fails enabled
      id: osuUser!.user_id, // Важно: принимает только user_id
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
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
  for (const recent of scores) {
    recents.push({
      beatmap_id: recent.beatmap.beatmap_id,
      score: recent.score,
      maxcombo: recent.max_combo,
      count50: recent.count_50,
      count100: recent.count_100,
      count300: recent.count_300,
      countmiss: recent.count_miss,
      countkatu: recent.count_katu,
      countgeki: recent.count_gekis,
      perfect: recent.full_combo,
      enabled_mods: recent.mods,
      user_id: osuUser!.id,
      date: recent.time,
      rank: recent.ranking,
      beatmap: await getBeatmap(server, recent.beatmap.beatmap_id, mode),
      pp: recent.pp,
      accuracy: recent.accuracy,
    });
    recents[recents.length - 1].beatmap.creator = recent.beatmap.creator; // Бред, но это правда так
  }

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
  const response = await axios.get('/user/scores/best', {
    baseURL: `https://${configServer.api.url}`,
    params: {
      mode,
      l: limit,
      id: osuUser!.user_id, // Важно: принимает только user_id
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
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
  for (const best of scores) {
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
      countgeki: best.count_gekis,
      perfect: best.full_combo,
      enabled_mods: best.mods,
      user_id: osuUser!.user_id,
      date: best.time,
      rank: best.ranking,
      pp: best.pp,
      replay_available: null,
      beatmap: await getBeatmap(server, best.beatmap.beatmap_id, mode),
      accuracy: best.accuracy,
    });
    bests[bests.length - 1].beatmap.creator = best.beatmap.creator; // Бред, но это правда так
  }

  return bests;
};

export const getScores = async (
  server: string,
  nickname: string,
  idBeatmap: string,
  limit: number = 1, // Гатари почему-то не выводит больше одного
  mode: string
): Promise<{ [key: string]: any }[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const osuUser = await getUser(server, nickname, mode);
  const response = await axios.get('/beatmap/user/score', {
    baseURL: `https://${configServer.api.url}`,
    params: {
      mode,
      b: idBeatmap,
      u: osuUser!.user_id, // Важно: принимает только user_id
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    throw new CustomError(
      responseFail(response.data?.error || response.statusText)
    );
  }
  const { score } = response.data;
  if (!score || !Object.keys(score).length) {
    throw new CustomError(
      `нет результата на \`${idBeatmap}\` от игрока \`${nickname}\` на \`${server}\` в режиме \`${mode}\`.`
    );
  }

  const scoreOnBeatmap = {
    score_id: score.id,
    score: score.score,
    username: osuUser!.username,
    count300: score.count_300,
    count100: score.count_100,
    count50: score.count_50,
    countmiss: score.count_miss,
    maxcombo: score.max_combo,
    countkatu: null,
    countgeki: null,
    perfect: null,
    enabled_mods: score.mods,
    user_id: osuUser!.user_id,
    date: score.time,
    rank: score.rank,
    pp: score.pp,
    replay_available: null,
    accuracy: score.accuracy,
    beatmap: await getBeatmap(server, idBeatmap, mode),
  };

  return [scoreOnBeatmap];
};
