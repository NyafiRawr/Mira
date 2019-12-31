import axios from 'axios';
import * as tools from '../tools';
import { calculateAccuracy } from '../osu';

export const getUser = async (server: string, idOrName: string, mode: string): Promise<{[key: string]: any} | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(parseInt(idOrName, 10)) ? { name: idOrName } : { id: idOrName };

  const response = await axios.get('/api/v1/users/full', {
    baseURL: `http://${configServer.api.url}`,
    params: addParams,
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { data } = response;

  const modeName = tools.getDataValueOnKey('osu!/mode', mode)[0];
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

export const getUserRecents = async (server: string, idOrName: string, limit: number, mode: string): Promise<{[key: string]: any}[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(parseInt(idOrName, 10)) ? { name: idOrName } : { id: idOrName };

  const response = await axios.get('/api/v1/users/scores/recent', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode,
      l: limit,
      ...addParams,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { scores } = response.data;
  const recents: {[key: string]: any}[] = [];

  scores.forEach((recent: any) => recents.push({
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
    user_id: null,
    date: recent.time,
    rank: recent.rank,
    // Only on gatari & ripple
    beatmap: recent.beatmap,
    pp: recent.pp,
    // Added
    accuracy: null,
  }));

  return recents;
};


export const getBeatmap = async (server: string, idBeatmap: string, mode: string): Promise<{[key: string]: any}[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const response = await axios.get('/beatmaps', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode, // not work
      bb: idBeatmap,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { data } = response;
  const difficulties: {[key: string]: any}[] = [];

  data.forEach((diff: any) => difficulties.push({
    approved: null, // diff.ranked_status_frozen ?
    submit_date: null,
    approved_date: null,
    last_update: diff.latest_update,
    artist: null,
    beatmap_id: diff.beatmap_id,
    beatmapset_id: diff.beatmapset_id,
    bpm: null,
    creator: null,
    creator_id: null,
    difficultyrating: diff.difficulty,
    diff_aim: null,
    diff_speed: null,
    diff_size: null,
    diff_overall: diff.od,
    diff_approach: diff.ar,
    diff_drain: null,
    hit_length: diff.hit_length,
    source: null,
    genre_id: null,
    language_id: null,
    title: null,
    total_length: null,
    version: null,
    file_md5: diff.beatmap_md5,
    mode: null,
    tags: null,
    favourite_count: null,
    rating: null,
    playcount: null,
    passcount: null,
    count_normal: null,
    count_slider: null,
    count_spinner: null,
    max_combo: diff.max_combo,
    download_unavailable: null,
    audio_unavailable: null,
    // Куда это?
    ranked: diff.ranked,
    song_name: diff.song_name,
    difficulty2: [
      diff.difficulty2.std,
      diff.difficulty2.taiko,
      diff.difficulty2.ctb,
      diff.difficulty2.mania,
    ][parseInt(mode, 10)],
  }));

  return difficulties;
};


export const getUserTops = async (server: string, idOrName: string, limit: number, mode: string): Promise<{[key: string]: any}[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(parseInt(idOrName, 10)) ? { name: idOrName } : { id: idOrName };

  const response = await axios.get('/api/v1/users/scores/best', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode,
      l: limit,
      ...addParams,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { scores } = response.data;
  const bests: {[key: string]: any}[] = [];

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
    countgeki: best.count_geki,
    perfect: best.full_combo,
    enabled_mods: best.mods,
    user_id: null,
    date: best.time,
    rank: best.rank,
    pp: best.pp,
    replay_available: null,
    // Only on gatari & ripple
    beatmap: best.beatmap,
    // Added
    accuracy: String(calculateAccuracy(
      mode, best.count300, best.count100, best.count50,
      best.countmiss, best.countkatu, best.countgeki,
    )),
  }));

  return bests;
};

export const getScores = async (server: string, idOrName: string, idBeatmap: string, limit: number, mode: string): Promise<{[key: string]: any}[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(parseInt(idOrName, 10)) ? { name: idOrName } : { id: idOrName };

  const response = await axios.get('/api/v1/scores', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      mode,
      b: idBeatmap,
      l: limit, // work? нужен скор с нескольими траями для теста
      ...addParams,
    },
  });
  if (response.status !== 200 || response.data.code !== 200) {
    return null;
  }

  const { scores } = response.data;

  const scoresOnBeatmap: {[key: string]: any}[] = [];
  // выкидывает все скорсы на сервере !!!!!
  scores.forEach((score: any) => scoresOnBeatmap.push({
    score_id: score.id,
    score: score.score,
    username: score.user.user_id,
    count300: score.count_300,
    count100: score.count_100,
    count50: score.count_50,
    countmiss: score.count_miss,
    maxcombo: score.max_combo,
    countkatu: score.count_katu,
    countgeki: score.count_geki,
    perfect: score.full_combo,
    enabled_mods: score.mods,
    user_id: score.user.user_id,
    date: score.time,
    rank: score.rank,
    pp: score.pp,
    replay_available: null,
    // Added
    accuracy: String(calculateAccuracy(
      mode, score.count300, score.count100, score.count50,
      score.countmiss, score.countkatu, score.countgeki,
    )),
  }));

  return scoresOnBeatmap;
};
