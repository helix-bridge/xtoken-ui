import { BN, BN_ZERO } from '@polkadot/util';
import { Observable } from 'rxjs';
import { CrossChainDirection, CrossToken, DVMChainConfig, Tx } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Bridge } from '../../../../core/bridge';
import { TxValidation } from '../../../../model';
import wringABI from '../config/wring.json';
import { IssuingPayload, RedeemPayload, SubstrateDVMSubstrateDVMBridgeConfig } from '../model';

export class SubstrateDVMInnerBridge extends Bridge<
  SubstrateDVMSubstrateDVMBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  back(payload: IssuingPayload): Observable<Tx> {
    const {
      sender,
      bridge,
      direction: { from: departure },
    } = payload;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

    return genEthereumContractTxObs(
      bridge.config.contracts!.issuing,
      (contract) => contract.deposit({ from: sender, value: amount.toString() }),
      wringABI
    );
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      sender,
      bridge,
      direction: { from: departure },
    } = payload;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

    return genEthereumContractTxObs(
      bridge.config.contracts!.issuing,
      (contract) => contract.withdraw(amount.toString(), { from: sender }),
      wringABI
    );
  }

  genTxParamsValidations(params: TxValidation): [boolean, string][] {
    const { balance, amount } = params;

    return [[balance.lt(amount), this.txValidationMessages.balanceLessThanAmount]];
  }

  async getFee(_: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>): Promise<BN> {
    return BN_ZERO;
  }
}