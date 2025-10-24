"use client"
import { useEffect, useState } from "react";
import Image from 'next/image'
import USDT from "../../../public/usdt.svg";
import Exchange from "../../../public/exchange.svg";
import assetPool from "../../../abi/assetPool.json";
import { arbitrumSepolia } from 'wagmi/chains';
import { parseUnits } from "ethers";
import { waitForTransactionReceipt } from '@wagmi/core'
import { useWriteContract, useReadContract } from 'wagmi';
import { useAccount } from 'wagmi'
import usdtAbi from "../../../abi/usdtAbi.json";

export default function AssetExchange({ ticket, price, token, loading, assetDetails }) {
    const [usdQty, setUsdQty] = useState(0)
    const [assetQty, setAssetQty] = useState(1)
    const [mintMode, setMintMode] = useState(true)
    const [sellMode, setSellMode] = useState(false)

    console.log(arbitrumSepolia)

    const account = useAccount()
    const { writeContractAsync } = useWriteContract()

    const  {data: accountId} =  useReadContract({
        chainId: arbitrumSepolia.id,
        address: '0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC',
        functionName: 'userToAccountId',
        abi: assetPool,
        args: [account?.address],
    })

    async function getAsset() {
        //const usdInWei = parseUnits(usdQty.toString(), 6);
        const usdInWei = 400000000

        console.log(usdInWei)

        const tx = await writeContractAsync({
            chainId: arbitrumSepolia.id,
            address: "0x80Efc4Bcb5797a952943512b10c1595aCdE821cC", // ERC20 token contract address
            abi: usdtAbi, // Standard ERC20 ABI
            functionName: 'approve',
            args: ["0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC", 500000000], // Contract address, amount to approve
        });

        const transactionReceipt = waitForTransactionReceipt({
            hash: tx,
        })

        const data = await writeContractAsync({
            chainId: arbitrumSepolia.id,
            address: '0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC', // change to receipient address
            functionName: 'mintAsset',
            abi: assetPool,
            args: [usdInWei, token.ticket], // Contract address, amount to approve
        })
        
    }

    async function redeemAsset(assetQty, usdQty) {
        if(mintMode) {
            const amountInWei = parseUnits(usdQty, 18);

            const tx = await writeContractAsync({
                chainId: arbitrumSepolia.chainId,
                address: "0x2217Ec8A7e4DF30002978184d6B3A077016f86F4", // ERC20 token contract address
                abi: usdtAbi, // Standard ERC20 ABI
                functionName: 'approve',
                args: ["0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC", amountInWei], // Contract address, amount to approve
            });

            const transactionReceipt = waitForTransactionReceipt({
                hash: tx,
            })

            const data = await writeContractAsync({
                chainId: arbitrumSepolia.chainId,
                address: '0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC', // change to receipient address
                functionName: 'mintAsset',
                abi: assetPool,
                args: [amountInWei, token.ticket, "7ccb1d64-3c4f-4b31-932d-ef8fce772db8"], // Contract address, amount to approve
            })

        } else {
            const amountInWei = parseUnits(assetQty, 18);

            const tx = await writeContractAsync({
                chainId: arbitrumSepolia.chainId,
                address: token.address, // ERC20 token contract address
                abi: dUsdAbi, // Standard ERC20 ABI
                functionName: 'approve',
                args: ["0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC", amountInWei], // TOKEN ADDRESS CHANGE!!!
            });

            const transactionReceipt = await waitForTransactionReceipt({
                hash: tx,
            })

            const data = await writeContractAsync({
                chainId: arbitrumSepolia.chainId,
                address: '0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC', // change to receipient address
                functionName: 'redeemAsset',
                abi: assetPool,
                args: [amountInWei, token.ticket, "7ccb1d64-3c4f-4b31-932d-ef8fce772db8"], // Contract address, amount to approve
            })
        }
    }

    useEffect(() => {
        setUsdQty(price)
    }, [loading, price])

    if (loading || price == 0) return (
        <p>Loading....</p>
    )

    return (
        <div className="">
            <div className="flex flex-col mb-12 justify-center items-center gap-8">
                <div className="flex flex-col md:flex-row md:space-y-0 md:gap-12 items-center gap-6">
                    <button type="button" className="border-[#5B6173] w-[200px] border-[1px] rounded-lg p-4 text-center flex justify-center items-center gap-2"
                        onClick={() => {
                            setMintMode(true)
                            setSellMode(false)
                        }}>Buy
                    </button>

                    <button type="button" className="border-[#5B6173] w-[200px] border-[1px] rounded-lg p-4 text-center flex justify-center items-center gap-2"
                        onClick={() => {
                            setSellMode(true)
                            setMintMode(false)
                        }}>Sell
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">

                    <div className="border-[#5B6173]  border-[1px] rounded-lg">
                        <div className="flex p-4 w-[200px] justify-between items-center">
                            <input type="text" className="w-full bg-transparent text-white focus:outline-none "
                                onChange={(e) => {
                                    setAssetQty((e.target.value / price).toFixed(4))
                                    setUsdQty(e.target.value)
                                }} value={usdQty}/>
                      
                            <p>USDT</p>
                        </div>
                    </div>

                    <div className="border-[#5B6173] border-[1px] rounded-lg  ">
                        <div className="flex p-4 w-[200px] justify-between items-center">
                            <input type="text" className="w-full bg-transparent text-white focus:outline-none "
                                onChange={(e) => {
                                    setUsdQty(e.target.value * price)
                                    setAssetQty(e.target.value)
                                }} value={assetQty} />
                        
                            <p>{ticket}</p>
                        </div>
                    </div>

                </div>

                <div className="flex pt-8 flex-col md:flex-row md:space-y-0 space-y-4 md:gap-12 items-center gap-6">
                    <button
                        className="w-[200px] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition"
                        onClick={() => getAsset()}
                    >
                        Trade 
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl mb-8">Statistics</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-center md:text-left">
                    <div className="flex flex-col gap-2">
                        <h3>24h Change</h3>
                        <p className="text-[#5B6173] text-sm">{assetDetails.priceChange.toFixed(2)}%</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3>24h Hight</h3>
                        <p className="text-[#5B6173] text-sm">{assetDetails.hightPrice.toFixed(2)}$</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3>24h Low</h3>
                        <p className="text-[#5B6173] text-sm">{assetDetails.lowPrice.toFixed(2)}$</p>
                    </div>
                </div>
            </div>
        </div>
    )
}