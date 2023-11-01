import Tooltip from "@/ui/tooltip";
import { getChainConfig } from "@/utils/chain";
import { getChainLogoSrc } from "@/utils/misc";
import Image from "next/image";
import BridgeLogo from "./pretty-bridge";
import { HistoryRecord } from "@/types/graphql";
import { bridgeFactory } from "@/utils/bridge";

interface Props {
  record?: HistoryRecord | null;
}

export default function TransferRoute({ record }: Props) {
  const sourceChain = getChainConfig(record?.fromChain);
  const targetChain = getChainConfig(record?.toChain);
  const bridge = record ? bridgeFactory({ category: record.bridge }) : undefined;

  return (
    <div className="gap-large flex items-center">
      <ChainIcon logo={getChainLogoSrc(sourceChain?.logo)} name={sourceChain?.name || "Unknown"} />
      <CaretRight />
      <BridgeLogo width={132} height={32} type="horizontal" bridge={bridge} />
      <CaretRight />
      <ChainIcon logo={getChainLogoSrc(targetChain?.logo)} name={targetChain?.name || "Unknown"} />
    </div>
  );
}

function ChainIcon({ logo, name }: { logo: string; name: string }) {
  return (
    <Tooltip content={<span className="text-xs font-normal text-white">{name}</span>} className="shrink-0">
      <Image width={40} height={40} alt={name} src={logo} className="rounded-full" />
    </Tooltip>
  );
}

function CaretRight() {
  return <Image width={9} height={12} alt="Caret right" src="/images/caret-right.svg" className="shrink-0" />;
}