import Warning from '../models/warning';
import * as Keyv from 'keyv';

export const set = async (
  serverId: string,
  victimId: string,
  reason: string
) => Warning.create({
    serverId,
    userId: victimId,
    reason
  });

// TODO: bad words with KEYV

