"use client";

import Header from "../components/Header";
import RegisterModal from "../components/RegisterModal";
import assetPoolAbi from "../../abi/assetPool.json";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "../../lib/contracts.js";
import Link from "next/link";

export default function FundAccount() {
  const { address, isConnected } = useAccount();

  const {
    data: isUserRegistered,
    isLoading,
    isError,
    error,
  } = useReadContract({
    address: CONTRACTS.assetPool,
    abi: assetPoolAbi,
    functionName: "isUserRegistered",
    args: [address],
    query: {
      enabled: !!address, 
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 md:px-10 pb-16">
        <div className="max-w-xl mx-auto mt-28">
          <div className="bg-[#1A1B1F] border border-[#2A2B33] rounded-2xl p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#CECCF6]">
              Register your account
            </h1>
            <p className="mt-2 text-sm opacity-80">
              To mint and redeem assets, you need to register an account ID in the protocol.
            </p>

            {!isConnected && (
              <div className="mt-6 rounded-xl bg-[#0E0B1C] border border-[#2A2B33] p-4">
                <div className="text-sm text-[#CECCF6] font-semibold">
                  Connect your wallet
                </div>
                <p className="text-xs opacity-70 mt-1">
                  Please connect your wallet to check if you’re already registered.
                </p>
              </div>
            )}

            {isConnected && isLoading && (
              <div className="mt-6 rounded-xl bg-[#0E0B1C] border border-[#2A2B33] p-4">
                <div className="text-sm text-[#CECCF6] font-semibold">
                  Checking registration…
                </div>
                <p className="text-xs opacity-70 mt-1">
                  Reading from the AssetPool contract.
                </p>
              </div>
            )}

            {isConnected && isError && (
              <div className="mt-6 rounded-xl bg-[#0E0B1C] border border-red-500/30 p-4">
                <div className="text-sm text-red-300 font-semibold">
                  Failed to check registration
                </div>
                <p className="text-xs opacity-70 mt-2 break-words">
                  {(error?.shortMessage || error?.message || "Unknown error").toString()}
                </p>
              </div>
            )}

            {isConnected && !isLoading && !isError && isUserRegistered === true && (
              <div className="mt-6 rounded-xl bg-[#0E0B1C] border border-green-500/20 p-4">
                <div className="text-sm text-[#CECCF6] font-semibold">
                  ✅ You’re registered
                </div>
                <p className="text-xs opacity-70 mt-1">
                  Wallet: <span className="font-mono">{address}</span>
                </p>

                <div className="mt-4 flex gap-3">
                  <Link
                    href="/assets"
                    className="bg-[#23242A] hover:bg-[#2A2B33] text-[#CECCF6] px-4 py-2 rounded-lg duration-100 text-sm"
                  >
                    Go to Assets
                  </Link>
                  <Link
                    href="/portfolio"
                    className="opacity-80 hover:opacity-100 text-sm px-4 py-2"
                  >
                    View Portfolio →
                  </Link>
                </div>
              </div>
            )}

            {isConnected && !isLoading && !isError && isUserRegistered === false && (
              <div className="mt-4 rounded-xl  p-2">
                <div className="mt-4">
                  <RegisterModal />
                </div>

                <p className="text-[11px] opacity-60 mt-3">
                  Note: this is a testnet demo. No real funds are involved.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
