import { EyeInvisibleFilled } from '@ant-design/icons';
import { hexToU8a } from '@polkadot/util';
import { message, Typography } from 'antd';
import BN from 'bn.js';
import { upperFirst } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from, mergeMap } from 'rxjs';
import { useDarwiniaAvailableBalances } from 'shared/hooks';
import {
  CrossChainComponentProps,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { fromWei, isRing, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../hooks';
import { useApi } from '../../providers';
import { IssuingPayload, Parachain2SubstrateBridgeConfig } from './model';
import { getIssuingFee } from './utils';
import { redeem } from './utils/tx';

const validateBeforeTx = (balance: BN, amount: BN, limit: BN): string | undefined => {
  const validations: [boolean, string][] = [
    [balance.lt(amount), 'Insufficient balance'],
    [limit.lt(amount), 'Insufficient daily limit'],
  ];

  const target = validations.find((item) => item[0]);

  return target && target[1];
};

export function Parachain2Substrate({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  Parachain2SubstrateBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>) {
  const { t } = useTranslation();
  const { departureConnection, departure } = useApi();
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const getBalances = useDarwiniaAvailableBalances(departure);
  const bridgeState = useCheckSpecVersion(direction);
  const [ring] = (balances ?? []) as BN[];

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.to.decimals }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction.from.meta.tokens, direction.to.decimals, fee]
  );

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (data: IssuingPayload) => {
      if (!fee || !dailyLimit || !ring) {
        return EMPTY;
      }

      const msg = validateBeforeTx(ring, new BN(toWei(data.direction.from)), dailyLimit);

      if (msg) {
        message.error(t(msg));
        return EMPTY;
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }),
        redeem(data, fee),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [
    afterCrossChain,
    ring,
    dailyLimit,
    departureConnection,
    fee,
    feeWithSymbol,
    getBalances,
    setTxObservableFactory,
    t,
  ]);

  useEffect(() => {
    const api = entrance.polkadot.getInstance(direction.from.meta.provider);

    const sub$$ = from(waitUntilConnected(api))
      .pipe(
        mergeMap(() => {
          const module = `from${upperFirst(direction.to.meta.name)}Issuing`;

          return from(api.query[module].secureLimitedRingAmount());
        })
      )
      .subscribe((result) => {
        const data = result.toJSON() as [number, string]; // [0, hexString]
        const num = hexToU8a(data[1]);

        setDailyLimit(new BN(num));
      });

    return () => sub$$.unsubscribe();
  }, [direction]);

  useEffect(() => {
    const sub$$ = from(getIssuingFee(bridge)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: isRing(direction.from.symbol) ? +fromWei({ value: result, decimals: direction.to.decimals }) : 0,
          symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.meta.tokens, direction.from.symbol, direction.to.decimals, onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <Typography.Text>{fromWei({ value: dailyLimit, decimals: 9 })}</Typography.Text>
            ) : (
              <EyeInvisibleFilled />
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}