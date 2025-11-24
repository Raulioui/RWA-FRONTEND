"use client"
import Header from "../components/Header";
import RegisterModal from "../components/RegisterModal";
import { useAccount } from 'wagmi'
import { useState } from "react";
import assetPoolAbi from '../../abi/assetPool.json';
import { useAccount, useReadContract } from "wagmi";

export default function FundAccount() {
    const { address } = useAccount();

    const { data: isUserRegistered } = useReadContract({
        address: "0xF0716eD7D975d82CCA4eD4AEAa43746842A4225F",
        abi: assetPoolAbi,
        functionName: "isUserRegistered",
        args: [address],
    });

    return (
        <div>
            <Header />

            <div className="text-center mt-44">
                {isUserRegistered ? (
                    <p>User is registered</p>
                ) : (
                    <div>
                        <p>User is not registered</p>
                        <RegisterModal />
                    </div>
                )}
            </div>

        </div>
    )
}