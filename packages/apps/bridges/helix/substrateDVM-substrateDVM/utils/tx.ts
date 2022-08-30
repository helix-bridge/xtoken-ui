import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { last } from 'lodash';
import { EMPTY, from, Observable, switchMap } from 'rxjs';
import { CrossChainDirection, CrossToken, DVMChainConfig, HelixHistoryRecord, Tx } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { AbiItem } from 'web3-utils';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { validationObsFactory } from '../../../../utils/tx';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';
import { IssuingPayload, RedeemPayload } from '../model';
import { getFee } from './fee';

const trimLaneId = (helixId: string) => {
  const id = last(helixId.split('-')) as string;
  return id.substring(10, id.length + 1);
};

export function issue(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
  const gasLimit = '1000000';

  return genEthereumContractTxObs(
    bridge.config.contracts!.backing,
    (contract) =>
      contract.methods
        .lockAndRemoteIssuing(to.meta.specVersion, gasLimit, departure.address, recipient, amount)
        .send({ from: sender, value: fee.toString() }),
    backingAbi as AbiItem[]
  );
}

export function redeem(value: RedeemPayload, fee: BN): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: { from: departure, to },
  } = value;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
  const gasLimit = '1000000';

  return genEthereumContractTxObs(
    bridge.config.contracts!.issuing,
    (contract) =>
      contract.methods
        .burnAndRemoteUnlock(to.meta.specVersion, gasLimit, departure.address, recipient, amount)
        .send({ from: sender, value: fee.toString() }),
    burnAbi as AbiItem[]
  );
}

export function refund(record: HelixHistoryRecord): Observable<Tx> {
  const { fromChain, toChain, sendAmount: amount, sender, id, sendTokenAddress: tokenAddress } = record;
  const bridge = getBridge([fromChain, toChain]);
  const departure = getChainConfig(fromChain) as DVMChainConfig;
  const arrival = getChainConfig(toChain) as DVMChainConfig;
  const transferId = trimLaneId(id);

  const { abi, address, method } = bridge.isRedeem(fromChain, toChain)
    ? { abi: backingAbi, address: bridge.config.contracts?.backing, method: 'remoteIssuingFailure' }
    : { abi: burnAbi, address: bridge.config.contracts?.issuing, method: 'remoteUnlockFailure' };

  return isMetamaskChainConsistent(arrival).pipe(
    switchMap((isConsistent) =>
      isConsistent
        ? from(
            getFee({ from: { meta: arrival }, to: { meta: departure } } as CrossChainDirection<
              CrossToken<DVMChainConfig>,
              CrossToken<DVMChainConfig>
            >)
          )
        : EMPTY
    ),
    switchMap((value) =>
      genEthereumContractTxObs(
        address as string,
        (contract) =>
          contract.methods[method](departure.specVersion, '2000000', transferId, tokenAddress, sender, amount).send({
            from: sender,
            value: value?.toString(),
          }),
        abi as AbiItem[]
      )
    )
  );
}

export const genValidations = ({ balance, amount, dailyLimit, allowance, fee }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!dailyLimit && dailyLimit.lt(amount), TxValidationMessages.dailyLimitLessThanAmount],
  [!!allowance && allowance?.lt(amount), TxValidationMessages.allowanceLessThanAmount],
  [!!fee && fee?.lt(BN_ZERO), TxValidationMessages.invalidFee],
];

export const validate = validationObsFactory(genValidations);