import axios from 'axios';
import * as tools from '../tools';

export const getUser = async (server, idOrName, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { u: idOrName } : { id: idOrName };

  const result = await axios.get('/user/stats', {
    baseURL: `http://${configServer.url}`,
    params: {
      mode,
      ...addParams,
    },
  });

  return result.data[0];
};

export const getUserRecent = async (server, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { u: idOrName } : { id: idOrName };

  const result = await axios.get('/user/scores/recent', {
    baseURL: `http://${configServer.url}`,
    params: {
      mode,
      l: limit,
      f: 1, // Fails
      ...addParams,
    },
  });

  return result.data[0];
};

export const getUserTop = async (server, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { u: idOrName } : { id: idOrName };

  const result = await axios.get('/user/scores/best', {
    baseURL: `http://${configServer.url}`,
    params: {
      mode,
      l: limit,
      ...addParams,
    },
  });
  console.log(result.data[0]);
  return result.data[0];
};

export const getScore = async (server, idBeatmap, idOrName, limit, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);
  const addParams = Number.isNaN(idOrName) ? { u: idOrName } : { id: idOrName };

  const result = await axios.get('/user/scores', {
    baseURL: `http://${configServer.url}`,
    params: {
      mode,
      b: idBeatmap,
      l: limit,
      ...addParams,
    },
  });

  return result.data[0];
};

export const getBeatmap = async (server, idBeatmap, mode) => {
  const configServer = tools.getDataValueOnKey('osu!/servers', server);

  const result = await axios.get('/beatmaps/get', {
    baseURL: `http://${configServer.url}`,
    params: {
      mode, // Нет в https://osu.gatari.pw/docs/api
      bb: idBeatmap,
    },
  });

  return result.data[0];
};
