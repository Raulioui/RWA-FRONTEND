import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia} from 'wagmi/chains';
import { http, createConfig } from 'wagmi'

const config = getDefaultConfig({
  appName: 'RWA-DEX',
  projectId: 'ab0c880b13da144956470b90cf7c72ef',
  chains: [arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
})

export default config;