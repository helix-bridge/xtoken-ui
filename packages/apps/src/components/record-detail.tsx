"use client";

import { QUERY_RECORD_BY_ID } from "@/config/gql";
import { RecordResponseData, RecordVariables } from "@/types/graphql";
import { Divider } from "@/ui/divider";
import { RecordLabel } from "@/components/record-label";
import { useQuery } from "@apollo/client";
import { PropsWithChildren, useMemo } from "react";
import TransferRoute from "@/components/transfer-route";
import TransactionStatus from "@/components/transaction-status";
import { TransactionHash } from "@/components/transaction-hash";
import TransactionTimestamp from "@/components/transaction-timestamp";
import PrettyAddress from "@/components/pretty-address";
import TransactionValue from "@/components/transaction-value";
import TokenToReceive from "@/components/token-to-receive";
import TokenTransfer from "@/components/token-transfer";
import ComponentLoading from "@/ui/component-loading";
import { BaseBridge } from "@/bridges/base";
import { bridgeFactory } from "@/utils/bridge";
import CountdownRefresh from "@/ui/countdown-refresh";
import TransactionFee from "./transaction-fee";
import { getChainConfig } from "@/utils/chain";

interface Props {
  id: string;
}

export default function RecordDetail(props: Props) {
  const {
    loading,
    data: record,
    refetch,
  } = useQuery<RecordResponseData, RecordVariables>(QUERY_RECORD_BY_ID, {
    variables: { id: props.id },
    notifyOnNetworkStatusChange: true,
  });

  const bridgeClient = useMemo<BaseBridge | undefined>(() => {
    const category = record?.historyRecordById?.bridge;
    const sourceChain = getChainConfig(record?.historyRecordById?.fromChain);
    const targetChain = getChainConfig(record?.historyRecordById?.toChain);
    const sourceToken = sourceChain?.tokens.find((t) => t.symbol === record?.historyRecordById?.sendToken);
    const targetToken = targetChain?.tokens.find((t) => t.symbol === record?.historyRecordById?.recvToken);

    if (category) {
      return bridgeFactory({ category, sourceChain, targetChain, sourceToken, targetToken });
    }

    return undefined;
  }, [record?.historyRecordById]);

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <h3 className="truncate text-xl font-semibold text-white">Transaction Detail</h3>
        <CountdownRefresh onClick={refetch} />
      </div>
      <div className="mt-5 overflow-x-auto">
        <div className="bg-component py-middle gap-middle relative flex min-w-max flex-col rounded px-7">
          {/* loading */}
          <ComponentLoading loading={loading} className="rounded" />

          <Item label="Transfer Route">
            <TransferRoute record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Status" tips="The status of the cross-chain transaction: Success, Pending, or Refunded.">
            <TransactionStatus record={record?.historyRecordById} />
          </Item>
          <Item
            label="Source Tx Hash"
            tips="Unique character string (TxID) assigned to every verified transaction on the Source Chain."
          >
            <TransactionHash
              chain={record?.historyRecordById?.fromChain}
              txHash={record?.historyRecordById?.requestTxHash}
            />
          </Item>
          <Item
            label="Target Tx Hash"
            tips="Unique character string (TxID) assigned to every verified transaction on the Target Chain."
          >
            <TransactionHash
              chain={record?.historyRecordById?.toChain}
              txHash={record?.historyRecordById?.responseTxHash}
            />
          </Item>
          <Item
            label="Timestamp"
            tips="The date and time at which a transaction is mined. And the time period elapsed for the completion of the cross-chain."
          >
            <TransactionTimestamp record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Sender" tips="Address (external or contract) sending the transaction.">
            {record?.historyRecordById?.sender ? (
              <PrettyAddress
                address={record.historyRecordById.sender}
                className="text-primary text-sm font-normal"
                copyable
              />
            ) : null}
          </Item>
          <Item label="Receiver" tips="Address (external or contract) receiving the transaction.">
            {record?.historyRecordById?.recipient ? (
              <PrettyAddress
                address={record.historyRecordById.recipient}
                className="text-primary text-sm font-normal"
                copyable
              />
            ) : null}
          </Item>
          <Item label="Token Transfer" tips="List of tokens transferred in this cross-chain transaction.">
            <TokenTransfer record={record?.historyRecordById} bridge={bridgeClient} />
          </Item>
          <Item label="Token To Receive">
            <TokenToReceive record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Value" tips="The amount to be transferred to the recipient with the cross-chain transaction.">
            <TransactionValue record={record?.historyRecordById} />
          </Item>
          <Item label="Transaction Fee" tips="Amount paid for processing the cross-chain transaction.">
            <TransactionFee record={record?.historyRecordById} />
          </Item>

          <Divider />

          <Item label="Nonce" tips="A unique number of cross-chain transaction in Bridge.">
            {record?.historyRecordById?.nonce ? (
              <span className="text-sm font-normal text-white">{record.historyRecordById.nonce}</span>
            ) : null}
          </Item>
        </div>
      </div>
    </>
  );
}

function Item({ label, tips, children }: PropsWithChildren<{ label: string; tips?: string }>) {
  return (
    <div className="lg:gap-middle gap-small flex flex-col items-start lg:h-11 lg:flex-row lg:items-center">
      <RecordLabel text={label} tips={tips} />
      <div className="pl-5 lg:pl-0">{children}</div>
    </div>
  );
}