"use client"
import Header from "../components/Header";
import RegisterModal from "../components/RegisterModal";
import assetPoolAbi from '../../abi/assetPool.json';
import { useAccount, useReadContract } from "wagmi";
import {CONTRACTS} from "../../lib/contracts.js"

export default function FundAccount() {
    const { address } = useAccount();

    const { data: isUserRegistered } = useReadContract({
        address: CONTRACTS.assetPool,
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