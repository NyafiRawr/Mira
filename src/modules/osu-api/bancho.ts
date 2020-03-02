import axios from 'axios';
import config from '../../config';
import * as tools from '../../utils/tools';
import { calculateAccuracy } from '../osu';
import CustomError from '../../utils/customError';
import { log } from '../../logger';
const status404 = 'нет ответа от сервера';

export const getUser = async (
  server: string,
  idOrName: string,
  mode: string
): Promise<{ [key: string]: any } | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  log.debug(server, idOrName, mode);
  const response = await axios.get('/api/get_user', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode,
      u: idOrName,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  if (response.status !== 200) {
    throw new CustomError(status404);
  }
  const data = response.data[0];
  if (data === undefined) {
    throw new CustomError(
      `игрок __**${idOrName}**__ не найден на сервере __**${server}**__ (режим: __**${mode}**__).`
    );
  }

  const gameUser = {
    user_id: data.user_id,
    username: data.username,
    join_date: data.join_date,
    total_hits: String(
      parseInt(data.count300, 10) +
      parseInt(data.count100, 10) +
      parseInt(data.count50, 10)
    ),
    playcount: data.playcount,
    ranked_score: data.ranked_score,
    total_score: data.total_score,
    pp_rank: data.pp_rank,
    level: data.level,
    pp_raw: data.pp_raw,
    accuracy: data.accuracy,
    count_rank_ss: data.count_rank_ss,
    count_rank_ssh: data.count_rank_ssh,
    count_rank_s: data.count_rank_s,
    count_rank_sh: data.count_rank_sh,
    count_rank_a: data.count_rank_a,
    country: data.country,
    total_seconds_played: data.total_seconds_played,
    pp_country_rank: data.pp_country_rank,
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
      m: mode,
      b: idBeatmap,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  if (response.status !== 200) {
    throw new CustomError(status404);
  }
  const { data } = response;

  const difficulties: { [key: string]: any }[] = [];
  data.forEach((diff: any) =>
    difficulties.push({
      approved: diff.approved,
      submit_date: diff.submit_date,
      approved_date: diff.approved_date,
      last_update: diff.last_update,
      artist: diff.artist,
      beatmap_id: diff.beatmap_id,
      beatmapset_id: diff.beatmapset_id,
      bpm: diff.bpm,
      creator: diff.creator,
      creator_id: diff.creator_id,
      difficultyrating: diff.difficultyrating,
      diff_aim: diff.diff_aim,
      diff_speed: diff.diff_speed,
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
      rating: diff.rating,
      playcount: diff.playcount,
      passcount: diff.passcount,
      count_normal: diff.count_normal,
      count_slider: diff.count_slider,
      count_spinner: diff.count_spinner,
      max_combo: diff.max_combo,
      download_unavailable: diff.download_unavailable,
      audio_unavailable: diff.audio_unavailable,
    })
  );

  return difficulties;
};

export const getUserRecents = async (
  server: string,
  idOrName: string,
  limit: number,
  mode: string
): Promise<{ [key: string]: any }[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const response = await axios.get('/api/get_user_recent', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode,
      u: idOrName,
      limit,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  if (response.status !== 200) {
    throw new CustomError(status404);
  }
  const { data } = response;
  const recents: { [key: string]: any }[] = [];

  for (const recent of data)
    recents.push({
      beatmap_id: recent.beatmap_id,
      score: recent.score,
      maxcombo: recent.maxcombo,
      count50: recent.count50,
      count100: recent.count100,
      count300: recent.count300,
      countmiss: recent.countmiss,
      countkatu: recent.countkatu,
      countgeki: recent.countgeki,
      perfect: recent.perfect,
      enabled_mods: recent.enabled_mods,
      user_id: recent.user_id,
      date: recent.date,
      rank: recent.rank,
      // Added
      pp: null, // TODO:
      beatmap: await getBeatmap(server, recent.beatmap_id, mode),
      accuracy: String(
        calculateAccuracy(
          mode,
          recent.count300,
          recent.count100,
          recent.count50,
          recent.countmiss,
          recent.countkatu,
          recent.countgeki
        )
      ),
    });

  return recents;
};

export const getUserTops = async (
  server: string,
  idOrName: string,
  limit: number,
  mode: string
): Promise<{ [key: string]: any }[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const response = await axios.get('/api/get_user_best', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode,
      u: idOrName,
      limit,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });
  if (response.status !== 200) {
    throw new CustomError(status404);
  }

  const { data } = response;
  const bests: { [key: string]: any }[] = [];

  for (const best of data)
    bests.push({
      beatmap_id: best.beatmap_id,
      score_id: best.score_id,
      score: best.score,
      maxcombo: best.maxcombo,
      count50: best.count50,
      count100: best.count100,
      count300: best.count300,
      countmiss: best.countmiss,
      countkatu: best.countkatu,
      countgeki: best.countgeki,
      perfect: best.perfect,
      enabled_mods: best.enabled_mods,
      user_id: best.user_id,
      date: best.date,
      rank: best.rank,
      pp: best.pp,
      replay_available: best.replay_available,
      // Added
      beatmap: await getBeatmap(server, best.beatmap_id, mode),
      accuracy: String(
        calculateAccuracy(
          mode,
          best.count300,
          best.count100,
          best.count50,
          best.countmiss,
          best.countkatu,
          best.countgeki
        )
      ),
    });

  return bests;
};

export const getScores = async (
  server: string,
  idOrName: string,
  idBeatmap: string,
  limit: number,
  mode: string
): Promise<{ [key: string]: any }[] | null> => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const response = await axios.get('/api/get_scores', {
    baseURL: `http://${configServer.api.url}`,
    params: {
      m: mode,
      u: idOrName,
      b: idBeatmap,
      limit,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  if (response.status !== 200) {
    throw new CustomError(status404);
  }

  const { data } = response;
  const scoresOnBeatmap: { [key: string]: any }[] = [];

  for (const score of data)
    scoresOnBeatmap.push({
      score_id: score.score_id,
      score: score.score,
      username: score.username,
      count300: score.count300,
      count100: score.count100,
      count50: score.count50,
      countmiss: score.countmiss,
      maxcombo: score.maxcombo,
      countkatu: score.countkatu,
      countgeki: score.countgeki,
      perfect: score.perfect,
      enabled_mods: score.enabled_mods,
      user_id: score.user_id,
      date: score.date,
      rank: score.rank,
      pp: score.pp,
      replay_available: score.replay_available,
      // Added
      beatmap: await getBeatmap(server, idBeatmap, mode),
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
    });

  return scoresOnBeatmap;
};
