"use client";

import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { PropsWithChildren } from "react";

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
});

export const SuiProvider = ({ children }: PropsWithChildren) => {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
      <WalletProvider autoConnect>{children}</WalletProvider>
    </SuiClientProvider>
  );
};
