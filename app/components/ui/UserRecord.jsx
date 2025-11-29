'use client';
import assetAbi from "../../../abi/assetPool.json";
import { useAccount, useReadContract } from "wagmi";
import { arbitrumSepolia } from 'wagmi/chains';

export default function UserRecord({ assetAddress }) {
  const account = useAccount();

  const { data: info } = useReadContract({
    address: assetAddress,
    abi: assetAbi,  
    functionName: "getUserRequests",
    chainId: arbitrumSepolia.chainId,
    args: [account?.address],
  });

  console.log("UserRecord data:", info);

}