import { BN, numberToHex } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import {
  CrossChainDirection,
  CrossToken,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { sendTransactionFromContract, signAndSendExtrinsic } from 'shared/utils/tx';
import abi from '../../../../config/abi/moonriver.json';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, ShidenMoonriverBridgeConfig } from '../model';

export class ShidenMoonriverBridge extends Bridge<
  ShidenMoonriverBridgeConfig,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig
> {
  static readonly alias: string = 'ShidenMoonriverBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

    const dest = api.createType('XcmVersionedMultiLocation', {
      V1: api.createType('XcmV1MultiLocation', {
        parents: 1,
        interior: api.createType('XcmV1MultilocationJunctions', {
          X1: api.createType('XcmV1Junction', {
            Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
          }),
        }),
      }),
    });

    const beneficiary = api.createType('XcmVersionedMultiLocation', {
      V1: api.createType('XcmV1MultiLocation', {
        parents: 0,
        interior: api.createType('XcmV1MultilocationJunctions', {
          X1: api.createType('XcmV1Junction', {
            AccountKey20: {
              network: api.createType('NetworkId', 'Any'),
              key: recipient,
            },
          }),
        }),
      }),
    });

    const assets = api.createType('XcmVersionedMultiAssets', {
      V1: [
        api.createType('XcmV1MultiAsset', {
          id: api.createType('XcmV1MultiassetAssetId', {
            Concrete: api.createType('XcmV1MultiLocation', {
              parents: 0,
              interior: api.createType('XcmV1MultilocationJunctions', 'Here'),
            }),
          }),
          fun: api.createType('XcmV1MultiassetFungibility', {
            Fungible: api.createType('Compact<u128>', amount),
          }),
        }),
      ],
    });

    const feeAssetItem = 0;
    const extrinsic = api.tx.polkadotXcm.reserveTransferAssets(dest, beneficiary, assets, feeAssetItem);

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    // [hex paraId, AccountId32 Network Any]
    const destination = [
      1,
      [`0x000000${numberToHex(arrival.meta.paraId).slice(2)}`, `0x01${convertToDvm(recipient).slice(2)}00`],
    ];
    const weight = 4_000_000_000;

    return sendTransactionFromContract(
      this.config.contracts!.issuing,
      (contract) => contract.transfer(departure.address, amount, destination, weight, { from: sender }),
      abi
    );
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(to, ['amount', 'meta']);
    const amount = this.isIssue(from.host, to.host) ? new BN('65168231790366830') : new BN('4635101624671734');

    return { ...token, amount } as TokenWithAmount;
  }
}