"use client"
import Header from "../components/Header";
import RegisterModal from "../components/RegisterModal";
import { useAccount } from 'wagmi'
import { useEffect, useState } from "react";
import { ethers } from 'ethers';
import assetPoolAbi from '../../abi/assetPool.json';

export default function FundAccount() {
    const { address } = useAccount();

    const [loading, setLoading] = useState(true);
    const [isUserRegistered, setIsUserRegistered] = useState(false);

    useEffect(() => {
        async function checkUserRegistration() {
            const provider = new ethers.JsonRpcProvider('https://arb-sepolia.g.alchemy.com/v2/ieYm8d748qFp12e9B0YO0haOD15fxPJo');
            const contractAddress = '0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC';

            // Make sure ABI is properly accessed
            const abi = assetPoolAbi.abi || assetPoolAbi; // Handle both formats
            const assetPoolContract = new ethers.Contract(contractAddress, abi, provider);

            const isUserRegistered = await assetPoolContract.isUserRegistered(address);
            return isUserRegistered;
        }

        if(address != undefined) {

        checkUserRegistration().then(isUserRegistered => {
            setIsUserRegistered(isUserRegistered);
            setLoading(false);
        });
    }
    }, [address])

    return (
        <div>
            <Header />
            {loading ? (
                <p>Loading...</p>
            ) : (
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
            )}
        </div>
    )
}