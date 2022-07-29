import { gql } from 'graphql-request';

export const HISTORY_RECORDS = gql`
  query historyRecords($row: Int!, $page: Int!, $sender: String, $results: [Int]) {
    historyRecords(row: $row, page: $page, sender: $sender, results: $results) {
      total
      records {
        amount
        bridge
        endTime
        fee
        feeToken
        fromChain
        id
        laneId
        nonce
        recipient
        requestTxHash
        responseTxHash
        targetTxHash
        reason
        result
        sender
        startTime
        toChain
        token
      }
    }
  }
`;

export const STATUS_STATISTICS = gql`
  query historyRecords($sender: String, $results: [Int!]) {
    historyRecords(sender: $sender, results: $results) {
      total
    }
  }
`;

export const HISTORY_RECORD_BY_ID = gql`
  query historyRecordById($id: String!) {
    historyRecordById(id: $id) {
      amount
      bridge
      endTime
      fee
      feeToken
      fromChain
      id
      laneId
      nonce
      recipient
      requestTxHash
      responseTxHash
      targetTxHash
      reason
      result
      sender
      startTime
      toChain
      token
    }
  }
`;