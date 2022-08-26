/// <reference types="jest" />

import { gqlName, toMiddleSplitNaming } from '../../utils/helper';

describe('common utils', () => {
  it('can extract gql name', () => {
    const historyRecords = `
        query historyRecords($row: Int!, $page: Int!, $sender: String, $recipient: String) {
                historyRecords(row: $row, page: $page, sender: $sender, recipient: $recipient) {
                        total
                }
        }
        `;
    const unlockRecord = `
        query unlockRecord($id: ID!) {
                unlockRecord(id: $id) {
                        id
                }
              }
        `;

    expect(gqlName(historyRecords)).toEqual('historyRecords');
    expect(gqlName(unlockRecord)).toEqual('unlockRecord');
  });

  it('can transfer camelCase to middle-split-naming', () => {
    expect(toMiddleSplitNaming('crabDVM')).toEqual('crab-dvm');
    expect(toMiddleSplitNaming('CrabDVM')).toEqual('crab-dvm');

    expect(toMiddleSplitNaming('crabParachain')).toEqual('crab-parachain');
    expect(toMiddleSplitNaming('CrabParachain')).toEqual('crab-parachain');

    expect(toMiddleSplitNaming('DVM')).toEqual('dvm');
  });
});
