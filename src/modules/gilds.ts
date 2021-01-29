import Gild from '../models/Gild';
import * as vars from '../modules/vars';
import config from '../config';
import { client } from '../client';
import { Collection } from 'discord.js';
import GildRelation from '../models/GildRelation';

Gild.sync();
GildRelation.sync();

// userId - gildId
export const invites = new Collection<string, number>();

//#region Prices
export const priceCreate = async (
  serverId: string,
  newValue: number | undefined = undefined
): Promise<number> => {
  const price =
    newValue != undefined
      ? await vars.set(serverId, 'gild_price_create', newValue.toString())
      : await vars.getOne(serverId, 'gild_price_create');
  if (price == null) {
    return config.gilds.defaultPriceCreate;
  }
  return parseInt(price.value, 10);
};
export const priceEditDesc = async (
  serverId: string,
  newValue: number | undefined = undefined
): Promise<number> => {
  const price =
    newValue != undefined
      ? await vars.set(serverId, 'gild_price_edit_desc', newValue.toString())
      : await vars.getOne(serverId, 'gild_price_edit_desc');
  if (price == null) {
    return config.gilds.defaultPriceEditDesc;
  }
  return parseInt(price.value, 10);
};
export const priceEditImg = async (
  serverId: string,
  newValue: number | undefined = undefined
): Promise<number> => {
  const price =
    newValue != undefined
      ? await vars.set(serverId, 'gild_price_edit_img', newValue.toString())
      : await vars.getOne(serverId, 'gild_price_edit_img');
  if (price == null) {
    return config.gilds.defaultPriceEditImg;
  }
  return parseInt(price.value, 10);
};
export const priceBuyChannelText = async (
  serverId: string,
  newValue: number | undefined = undefined
): Promise<number> => {
  const price =
    newValue != undefined
      ? await vars.set(
          serverId,
          'gild_price_buy_channel_text',
          newValue.toString()
        )
      : await vars.getOne(serverId, 'gild_price_buy_channel_text');
  if (price == null) {
    return config.gilds.defaultPriceBuyChannelText;
  }
  return parseInt(price.value, 10);
};
export const priceBuyChannelVoice = async (
  serverId: string,
  newValue: number | undefined = undefined
): Promise<number> => {
  const price =
    newValue != undefined
      ? await vars.set(
          serverId,
          'gild_price_buy_channel_voice',
          newValue.toString()
        )
      : await vars.getOne(serverId, 'gild_price_buy_channel_voice');
  if (price == null) {
    return config.gilds.defaultPriceBuyChannelVoice;
  }
  return parseInt(price.value, 10);
};
export const creationCategoryId = async (
  serverId: string,
  newValue: string | undefined = undefined
): Promise<string | null> => {
  const price =
    newValue != undefined
      ? await vars.set(serverId, 'gild_creation_category_id', newValue)
      : await vars.getOne(serverId, 'gild_creation_category_id');
  if (price == null) {
    return null;
  }
  return price.value;
};
//#endregion

export const getOne = async (gildId: number): Promise<Gild | null> =>
  Gild.findByPk(gildId);

export const getAll = async (serverId: string): Promise<Gild[]> =>
  Gild.findAll({
    where: {
      serverId,
    },
  });

export const create = async (
  serverId: string,
  ownerId: string,
  name: string
): Promise<Gild> => Gild.create({ serverId, ownerId, name });

export const remove = async (serverId: string, gild: Gild): Promise<void> => {
  await Gild.destroy({
    where: { serverId, id: gild.id },
    cascade: true,
  }); // Удаление гильдии освобождает её участников

  try {
    if (gild.channels != null) {
      const channels = JSON.parse(gild.channels);
      const guild = await client.guilds.fetch(serverId);
      channels.texts.map(async (channelId: string) => {
        await guild.channels
          .resolve(channelId)
          ?.delete(`Удаление гильдии с ID: ${gild.id}`);
      });
      channels.voices.map(async (channelId: string) => {
        await guild.channels
          .resolve(channelId)
          ?.delete(`Удаление гильдии с ID: ${gild.id}`);
      });
    }
  } catch {
    throw new Error(
      'произошла ошибка при удалении каналов гильдии, возможно у меня нет прав.'
    );
  }
};
