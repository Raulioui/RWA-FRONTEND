"use client"
import Header from "../components/Header";
import RegisterModal from "../components/RegisterModal";
import assetPoolAbi from '../../abi/assetPool.json';
import { useAccount, useReadContract } from "wagmi";

export default function FundAccount() {
    const { address } = useAccount();

    const { data: isUserRegistered } = useReadContract({
        address: "0x549746c116153aFA22c4A1927E9DD4Cb30A26797",
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