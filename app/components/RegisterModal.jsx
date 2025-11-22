'use client';

import assetPoolAbi from "../../abi/assetPool.json";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { arbitrumSepolia } from 'wagmi/chains';
import { createAccount } from "../../helpers/api";
import { parseUnits } from "ethers";
import usdtAbi from '../../abi/usdtAbi.json';
import { useRouter } from 'next/navigation';

export default function RegisterModal() {
  const { data: hash, writeContract, isPending, isError, error } = useWriteContract();
  const { address, isConnected } = useAccount();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const { data: usdtAddress } = useReadContract({
    address: "0xF0716eD7D975d82CCA4eD4AEAa43746842A4225F",
    abi: assetPoolAbi,
    functionName: "usdt",
    chainId: arbitrumSepolia.chainId,
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!usdtAddress) {
      alert("USDT address not loaded yet");
      return;
    }

    setIsRegistering(true);
    
    try {
      // Step 1: Create account in backend
      const accountId = await createAccount(name, email, familyName);

      // Step 2: Register user on blockchain
      writeContract({
        chainId: arbitrumSepolia.chainId,
        address: '0xF0716eD7D975d82CCA4eD4AEAa43746842A4225F',
        functionName: 'registerUser',
        abi: assetPoolAbi,
        args: ["983f386c-75a0-4d49-ad27-c1feef93b22b"]
      });

      // Wait for registration transaction to be confirmed
      // Note: You'll need to implement a way to wait for the transaction
      // For now, adding a delay (not ideal, but functional)
      //await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Mint USDT to user
      writeContract({
      chainId: arbitrumSepolia.chainId,
      address: usdtAddress,
      functionName: 'mint',
      abi: usdtAbi,
      args: [address, parseUnits("1000", 6)]
    });

      // Wait for mint transaction to be confirmed
     // await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirect to market
    } catch (error) {
      console.error("Registration error:", error);
      alert(`Registration failed: ${error.message || "Please try again."}`);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full mx-auto max-w-md bg-[#1E1C34] border border-gray-700 rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Register to Alpaca 🌐</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="name"
          type="text"
          placeholder="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isRegistering}
          className="w-full p-3 bg-[#0E0B1C] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <input
          name="lastname"
          type="text"
          placeholder="Last Name"
          required
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          disabled={isRegistering}
          className="w-full p-3 bg-[#0E0B1C] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isRegistering}
          className="w-full p-3 bg-[#0E0B1C] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!usdtAddress || !isConnected || isRegistering}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isRegistering ? "Processing..." : "Register & Claim USDT"}
        </button>
      </form>

      {!isConnected && (
        <p className="text-xs text-center text-red-400 mt-2">
          Please connect your wallet to register
        </p>
      )}

      <p className="text-xs text-center text-gray-400 mt-4">
        Already have an account? <a href="/login" className="underline text-purple-400">Log in</a>
      </p>
    </div>
  );
}