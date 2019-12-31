import axios from 'axios';
import * as tools from '../tools';

export const getUser = async (server: string, idOrName: string, mode: string): Promise<{[key: string]: any} | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(parseInt(idOrName, 10)) ? { u: idOrName } : { id: idOrName };

  const responseInfo = await axios.get('/users/get', {
    baseURL: `http://${configServer.api.url}`,
    params: addParams,
  });
  const responseStats = await axios.get('/user/stats', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode,
      ...addParams,
    },
  });
  if (responseInfo.status !== 200 || responseStats.status !== 200) {
    return null;
  }
  // eslint-disable-next-line prefer-destructuring
  const dataInfo = responseInfo.data.users[0];
  const dataStats = responseStats.data.stats;

  const gameUser = {
    user_id: dataStats.id,
    username: dataInfo.username,
    join_date: dataInfo.registered_on,
    total_hits: dataStats.total_hits,
    playcount: dataStats.playcount,
    ranked_score: dataStats.ranked_score,
    total_score: dataStats.total_score,
    pp_rank: dataStats.rank,
    level: dataStats.level + (dataStats.level_progress / 100),
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

export const getUserRecents = async (server: string, idOrName: string, limit: number, mode: string): Promise<Array<{[key: string]: any}> | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(parseInt(idOrName, 10)) ? { u: idOrName } : { id: idOrName };

  const response = await axios.get('/user/scores/recent', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode,
      l: limit,
      // Only on gatari: fails enabled
      f: 1,
      ...addParams,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { scores } = response.data;
  const recents: Array<{[key: string]: any}> = [];

  scores.forEach((recent: any) => recents.push({
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
    user_id: null,
    date: recent.time,
    rank: recent.ranking,
    // Only on gatari & ripple
    beatmap: recent.beatmap,
    pp: recent.pp,
    // Only on gatari
    accuracy: recent.accuracy,
  }));

  return recents;
};

export const getBeatmap = async (server: string, idBeatmap: string, mode: string): Promise<Array<{[key: string]: any}> | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const response = await axios.get('/beatmaps/get', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode, // not work & отсутствует в https://osu.gatari.pw/docs/api
      bb: idBeatmap,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { data } = response;
  const difficulties: Array<{[key: string]: any}> = [];

  data.forEach((diff: any) => difficulties.push({
    approved: null, // diff.ranked_status_freezed, // это оно?
    submit_date: null,
    approved_date: null, // diff.ranking_data, // это оно? тип данных не дата, а большое число
    last_update: null,
    artist: diff.artist,
    beatmap_id: diff.beatmap_id,
    beatmapset_id: diff.beatmapset_id,
    bpm: null,
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
    total_length: null,
    version: diff.version,
    file_md5: null,
    mode: diff.mode,
    tags: null,
    favourite_count: null,
    rating: diff.rating,
    playcount: null,
    passcount: null,
    count_normal: null,
    count_slider: null,
    count_spinner: null,
    max_combo: diff.max_combo,
    download_unavailable: null,
    audio_unavailable: null,
  }));

  return difficulties;
};

export const getUserTops = async (server: string, idOrName: string, limit: number, mode: string): Promise<Array<{[key: string]: any}> | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  let osuUser = {
    user_id: idOrName,
  };
  // Важно: API принимает только USER_ID
  if (Number.isNaN(parseInt(osuUser.user_id, 10))) {
    const res = await getUser(server, idOrName, mode);
    if (osuUser === null) { return null; }

    osuUser = res as any;
  }

  const response = await axios.get('/user/scores/best', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode,
      l: limit,
      u: osuUser.user_id,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { scores } = response.data;
  const bests: Array<{[key: string]: any}> = [];

  scores.forEach((best: any) => bests.push({
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
    user_id: osuUser.user_id,
    date: best.time,
    rank: best.ranking,
    pp: best.pp,
    replay_available: null,
    // Only on gatari & ripple
    beatmap: best.beatmap,
    accuracy: best.accuracy,
  }));

  return bests;
};

export const getScores = async (server: string, idOrName: string, idBeatmap: string, limit: number, mode: string): Promise<{[key: string]: any} | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  // Важно: API принимает только USER_ID
  const osuUser = await getUser(server, idOrName, mode);
  if (osuUser === null) { return null; }

  const response = await axios.get('/beatmap/user/score', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode,
      b: idBeatmap,
      l: limit, // work? нужен скор с нескольими траями для теста
      u: osuUser.user_id,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { score } = response.data;

  const scoreOnBeatmap = {
    score_id: score.id,
    score: score.score,
    username: osuUser.username,
    count300: score.count_300,
    count100: score.count_100,
    count50: score.count_50,
    countmiss: score.count_miss,
    maxcombo: score.max_combo,
    countkatu: null,
    countgeki: null,
    perfect: null,
    enabled_mods: score.mods,
    user_id: osuUser.user_id,
    date: score.time,
    rank: score.rank,
    pp: score.pp,
    replay_available: null,
    // Only on gatari:
    accuracy: score.accuracy,
  };

  return scoreOnBeatmap;
};
