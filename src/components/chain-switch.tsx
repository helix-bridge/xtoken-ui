import { getChainConfig, getChainConfigs, getChainLogoSrc } from "@/utils";
import {
  FloatingPortal,
  Placement,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";

const chainOptions = getChainConfigs();

export default function ChainSwitch({ placement }: { placement?: Placement }) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, context, floatingStyles } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6)],
  });
  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const activeChain = useMemo(() => getChainConfig(chain?.id), [chain?.id]);

  return (
    <>
      <button
        className="flex h-9 w-fit items-center justify-between gap-2 rounded-xl bg-white/20 px-large lg:h-8"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {activeChain ? (
          <>
            <Image alt="Active chain" width={20} height={20} src={getChainLogoSrc(activeChain.logo)} />
            <Image
              style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
              className="shrink-0 transition-transform"
              src="/images/caret-down.svg"
              alt="Caret down"
              width={16}
              height={16}
            />
          </>
        ) : (
          <>
            <Image alt="Wrong chain" width={18} height={18} src="/images/warning.svg" />
            <span className="text-sm font-bold text-orange-400">Wrong Chain</span>
          </>
        )}
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div
              style={styles}
              className="app-scrollbar flex max-h-[18rem] flex-col overflow-y-auto rounded-xl border border-white/20 bg-background py-2"
              onClick={() => setIsOpen(false)}
            >
              {chainOptions.map((option) => (
                <button
                  className="flex items-center gap-medium px-large py-medium transition-colors hover:bg-white/5 disabled:bg-white/10"
                  disabled={option.id === chain?.id}
                  key={option.id}
                  onClick={() => switchNetwork?.(option.id)}
                >
                  <Image alt="Chain" width={20} height={20} src={getChainLogoSrc(option.logo)} />
                  <span className="text-sm font-bold text-white">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
