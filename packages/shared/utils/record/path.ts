import { HelixHistoryRecord, Network } from '../../model';
import { BridgePredicateFn, isSubstrateSubstrateDVM, isSubstrateDVM, isParachainSubstrate, isCBridge } from '../bridge';

type DirectionPaths = [BridgePredicateFn, string, string];

export function getDetailPaths(fromChain: Network, toChain: Network, record: HelixHistoryRecord): string[] {
  const filters: DirectionPaths[] = [
    [isSubstrateSubstrateDVM, 's2s', record.id],
    [isSubstrateDVM, 's2dvm', record.id],
    [isParachainSubstrate, 's2parachain', record.id],
    [isCBridge, 'cbridge', record.id],
  ];
  const result = filters.find(([predicate]) => predicate(fromChain, toChain));

  return result ? (result.slice(1) as string[]) : [];
}