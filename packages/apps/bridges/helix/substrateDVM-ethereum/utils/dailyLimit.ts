import { BN } from '@polkadot/util';
import { Contract } from 'ethers';
import { CrossChainDirection, CrossToken, EthereumChainConfig } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { getBridge } from 'utils/bridge';
import { getWrappedToken } from '../../../../utils/network';
import backingAbi from '../config/backing.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';

export async function getDailyLimit(
  direction: CrossChainDirection<CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>
): Promise<BN | null> {
  const {
    from: { meta: departure },
    to: { meta: arrival, address: tokenAddress, type },
  } = direction;
  const bridge = getBridge([departure, arrival]);

  const { abi, address } = bridge.isIssue(departure, arrival)
    ? { abi: mappingTokenAbi, address: bridge.config.contracts?.issuing }
    : { abi: backingAbi, address: bridge.config.contracts?.backing };

  const contract = new Contract(address as string, abi, entrance.web3.getInstance(direction.to.meta.provider));

  const limit = await contract.calcMaxWithdraw(type === 'native' ? getWrappedToken(arrival).address : tokenAddress);

  return new BN(limit.toString());
}