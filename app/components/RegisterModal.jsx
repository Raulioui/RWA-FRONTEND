'use client';

import assetPoolAbi from "../../abi/assetPool.json";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { arbitrumSepolia } from 'wagmi/chains';
import { createAccount } from "../../helpers/api";
import { parseUnits } from "viem";
import usdtAbi from '../../abi/usdtAbi.json';
import { useRouter } from 'next/navigation';

export default function RegisterModal() {
  const { data: hash, writeContract, isPending, isError, error } = useWriteContract();
  const { address, isConnected } = useAccount();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { data: brokerDollar } = useReadContract({
    address: "0x7A58A13594872953765928c1f0b79d3494412525",
    abi: assetPoolAbi,
    functionName: "brokerDollar",
    chainId: arbitrumSepolia.chainId,
  });

  console.log("USDT Address:", brokerDollar);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!brokerDollar) {
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
        address: '0x7A58A13594872953765928c1f0b79d3494412525',
        functionName: 'registerUser',
        abi: assetPoolAbi,
        args: ["884e6a75-1c18-4da6-9761-ddd51445de50"]
      });

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
          disabled={!brokerDollar || !isConnected || isRegistering}
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