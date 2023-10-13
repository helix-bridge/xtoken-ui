import { BN } from '@polkadot/util';
import { DVMChainConfig, Tx } from 'shared/model';
import { Observable } from 'rxjs';
import { IssuingPayload, RedeemPayload, ArbitrumZksyncBridgeConfig } from '../model';
import { LnBridgeBridge } from '../../lnbridge/utils/bridge';

export class ArbitrumZksyncBridge extends LnBridgeBridge<ArbitrumZksyncBridgeConfig, DVMChainConfig, DVMChainConfig> {
  static readonly alias: string = 'ArbitrumZksyncLnBridge';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }
}