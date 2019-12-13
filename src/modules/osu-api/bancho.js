import axios from 'axios';
import config from '../../config';
import * as tools from '../tools';

export const getUser = async (server, idOrName, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const result = await axios.get('/api/get_user', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      u: idOrName,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  return result.data[0];
};

export const getUserRecent = async (server, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const result = await axios.get('/api/get_user_recent', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      u: idOrName,
      limit,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  return result.data[0];
};

export const getUserTop = async (server, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const result = await axios.get('/api/get_user_best', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      u: idOrName,
      limit,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  return result.data[0];
};

export const getScore = async (server, idBeatmap, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const result = await axios.get('/api/get_scores', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      u: idOrName,
      b: idBeatmap,
      limit,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  return result.data[0];
};

export const getBeatmap = async (server, idBeatmap, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const result = await axios.get('/api/get_beatmaps', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      b: idBeatmap,
      k: server === 'bancho' ? config.osu_token : undefined,
    },
  });

  return result.data[0];
};
