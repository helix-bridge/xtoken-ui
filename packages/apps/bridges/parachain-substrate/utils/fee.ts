import { Codec } from '@polkadot/types-codec/types';
import BN from 'bn.js';
import { last } from 'lodash';
import { Bridge, ChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';

const queryFeeFromRelayers = async (_: ChainConfig, to: ChainConfig) => {
  const api = entrance.polkadot.getInstance(to.provider);
  const section = `${to.name}ParachainFeeMarket`;

  await waitUntilConnected(api);

  return api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON()) as Promise<
    {
      id: string;
      collateral: number;
      fee: number;
    }[]
  >;
};

async function getFee(from: ChainConfig, to: ChainConfig): Promise<BN> {
  const res = await queryFeeFromRelayers(from, to);

  const marketFee = last(res)?.fee.toString();

  return new BN(marketFee ?? -1); // -1: fee market does not available
}

export async function getIssuingFee(bridge: Bridge): Promise<BN> {
  return getFee(bridge.departure, bridge.arrival);
}

export const getRedeemFee = getIssuingFee;