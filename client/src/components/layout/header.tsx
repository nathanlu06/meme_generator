"use client";

import { truncateAddress } from "@/lib/utils";
import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import "@mysten/dapp-kit/dist/index.css";
import { signOut } from "next-auth/react";

const Header = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  return (
    <header className="fixed top-0 left-0 right-0 container px-5 sm:px-0 py-5 flex flex-row items-center justify-between text-xs sm:text-base z-50">
      <h1 className="text-sm sm:text-2xl font-bold text-white">AI Terminal</h1>
      {currentAccount ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button>{truncateAddress(currentAccount.address)}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit">
            <Button
              onClick={() => {
                disconnect();
                signOut({ redirect: false });
              }}
              className="bg-red-400"
            >
              Disconnect
            </Button>
          </PopoverContent>
        </Popover>
      ) : (
        <ConnectModal
          trigger={
            <Button>
              Connect <span className="hidden sm:block">Wallet</span>
            </Button>
          }
        />
      )}
    </header>
  );
};

export default Header;
