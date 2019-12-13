import axios from 'axios';
import * as tools from '../tools';

export const getUser = async (server, idOrName, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { name: idOrName } : { id: idOrName };

  const result = await axios.get('/api/v1/users/full', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      ...addParams,
    },
  });

  // compliance result.data[0]

  return result.data[0];
};

export const getUserRecent = async (server, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { name: idOrName } : { id: idOrName };

  const result = await axios.get('/api/v1/users/scores/recent', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      limit,
      ...addParams,
    },
  });

  return result.data[0];
};

export const getUserTop = async (server, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { name: idOrName } : { id: idOrName };

  const result = await axios.get('/api/v1/users/scores/best', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      limit,
      ...addParams,
    },
  });

  return result.data[0];
};

export const getScore = async (server, idBeatmap, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { name: idOrName } : { id: idOrName };

  const result = await axios.get('/api/v1/scores', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      b: idBeatmap,
      limit,
      ...addParams,
    },
  });

  return result.data[0];
};

export const getBeatmap = async (server, idBeatmap, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const result = await axios.get('/api/scores', {
    baseURL: `http://${configServer.url}`,
    params: {
      m: mode,
      b: idBeatmap,
      md5: undefined,
    },
  });

  return result.data[0];
};
