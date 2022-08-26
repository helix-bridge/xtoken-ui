import { isEqual } from 'lodash';
import { BRIDGES } from '../../config/bridge';
import { unknownUnavailable } from '../../config/bridges/unknown-unavailable';
import { Bridge, BridgeConfig, ChainConfig, CrossChainDirection, Network } from '../../model';
import { getChainConfig } from '../network/network';

export function getBridge<T extends BridgeConfig>(
  source: CrossChainDirection | [Network | ChainConfig, Network | ChainConfig]
): Bridge<T> {
  const direction = Array.isArray(source)
    ? source.map((item) => (typeof item === 'object' ? item.name : (item as Network)))
    : [source.from, source.to].map((item) => {
        const conf = item.meta ?? getChainConfig(item.host);

        return conf.name;
      });

  const bridge = BRIDGES.find((item) => isEqual(item.issue, direction) || isEqual(item.redeem, direction));

  if (!bridge) {
    console.log(
      '🚨 ~ file: bridge.ts ~ line 95 ~ Error',
      `Bridge from ${direction[0]} to ${direction[1]} is not exist`
    );

    return unknownUnavailable as Bridge<T>;
  }

  return bridge as Bridge<T>;
}

export function getBridges(source: CrossChainDirection): Bridge[] {
  const {
    from: { cross },
    to,
  } = source;

  const overviews = cross.filter((bridge) => {
    const { partner } = bridge;

    return partner.symbol.toLowerCase() === to.symbol.toLowerCase() && isEqual(partner.name, to.meta.name);
  });

  return BRIDGES.filter(
    (bridge) =>
      bridge.isTest === source.from.meta.isTest &&
      (bridge.isIssue(source.from.meta, source.to.meta) || bridge.isRedeem(source.from.meta, source.to.meta)) &&
      overviews.find((overview) => overview.category === bridge.category && overview.bridge === bridge.name)
  );
}
