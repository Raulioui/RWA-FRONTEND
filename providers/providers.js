"use client"

import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import config from '../config/config';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({children}) {

    return(
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider 
                    modalSize='compact' 
                    initialChain={arbitrumSepolia}     
                    theme={darkTheme({
                      accentColor: '#1E1C34',
                      accentColorForeground: 'white',
                      borderRadius: 'small',
                      fontStack: 'system',
                      overlayBlur: 'small',
                    })}>
                    {children}  
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}