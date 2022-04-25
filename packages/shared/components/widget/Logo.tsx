import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { ChainConfig, LogoType } from '../../model';
import { getNetworkMode } from '../../utils';

interface LogoProps extends Omit<ImageProps, 'src'> {
  chain?: ChainConfig | null | undefined;
  defaultLogo?: string;
  logoType?: LogoType;
}

export function Logo({ chain, logoType = 'main', defaultLogo = '', ...rest }: LogoProps) {
  const [logo, setLogo] = useState(defaultLogo);

  useEffect(() => {
    if (!chain) {
      return;
    }

    const mode = getNetworkMode(chain);
    const target = chain.logos.find((item) => item.mode === mode && item.type === logoType);

    if (target) {
      setLogo(target.name);
    }
  }, [chain, logoType]);

  return <Image {...rest} src={`/image/${logo}`} />;
}