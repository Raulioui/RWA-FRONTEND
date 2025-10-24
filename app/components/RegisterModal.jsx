'use client';

import assetPoolAbi from "../../abi/assetPool.json";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { arbitrumSepolia } from 'wagmi/chains';
import { createAccount } from "../../helpers/api";
import { parseUnits } from "ethers";
import usdtAbi from '../../abi/usdtAbi.json';
import {useRouter} from 'next/navigation';

export default function RegisterModal() {
  const { writeContract } = useWriteContract()
  const { address, isConnected } = useAccount();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [familyName, setFamilyName] = useState('');
  const router = useRouter();

  const { data: usdtAddress } = useReadContract({
    address: "0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC",
    abi: assetPoolAbi,
    functionName: "usdt",
    chainId: arbitrumSepolia.chainId,
  });

  async function mintUsdtToUser(amount = "1000") {
    if (!usdtAddress) {
      console.error("USDT address not loaded yet");
      return;
    }

    const data = await writeContract({
      chainId: arbitrumSepolia.chainId,
      address: usdtAddress,
      functionName: 'mint',
      abi: usdtAbi, // Use USDT/ERC20 ABI
      args: [address, parseUnits(amount, 6)] // USDT typically has 6 decimals
    })

    return data;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const accountId = await createAccount(name, email, familyName)

      await writeContract({
        chainId: arbitrumSepolia.chainId,
        address: '0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC',
        functionName: 'registerUser',
        abi: assetPoolAbi,
        args: [accountId]
      })
      
      await mintUsdtToUser("1000") 

      router.push("market")
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
  }

  return (
    <>
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
            className="w-full p-3 bg-[#0E0B1C] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            name="lastname"
            type="text"
            placeholder="Last Name"
            required
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full p-3 bg-[#0E0B1C] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-[#0E0B1C] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!usdtAddress}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
            Register & Claim USDT
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-4">
          Already have an account? <a href="/login" className="underline text-purple-400">Log in</a>
        </p>
      </div>
    </>
  );
}