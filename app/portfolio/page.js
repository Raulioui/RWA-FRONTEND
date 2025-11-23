'use client';

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { arbitrumSepolia } from 'wagmi/chains';
import assetPoolAbi from "../../abi/assetPool.json";
import assetAbi from "../../abi/assetAbi.json"; // Standard ERC20 ABI
import usdtAbi from '../../abi/usdtAbi.json';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/ui/Loader";
import AssetComponentPortfolio from "../components/ui/AssetComponentPortfolio";

const ASSET_POOL_ADDRESS = "0xF0716eD7D975d82CCA4eD4AEAa43746842A4225F";

export default function PortfolioPage() {
    const { address, isConnected } = useAccount();
    const [portfolioData, setPortfolioData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get all registered token tickets
    const { data: tickets } = useReadContract({
        address: ASSET_POOL_ADDRESS,
        abi: assetPoolAbi,
        functionName: "getAllTokenTickets",
        chainId: arbitrumSepolia.chainId,
    });

    // Get asset info for each ticket
    const { data: assetsInfo } = useReadContracts({
        contracts: tickets?.map(ticket => ({
            address: ASSET_POOL_ADDRESS,
            abi: assetPoolAbi,
            functionName: "getAssetInfo",
            args: [ticket],
            chainId: arbitrumSepolia.chainId,
        })) || [],
    });

    // Get balances for each asset
    const { data: balances } = useReadContracts({
        contracts: assetsInfo?.map(asset => ({
            address: asset.result?.assetAddress,
            abi: assetAbi,
            functionName: "balanceOf",
            args: [address],
            chainId: arbitrumSepolia.chainId,
        })).filter(contract => contract.address) || [],
        enabled: !!address && !!assetsInfo,
    });

    const usdtBalance = useReadContract({
        address: "0x80Efc4Bcb5797a952943512b10c1595aCdE821cC",
        abi: usdtAbi,
        functionName: "balanceOf",
        args: [address],
        chainId: arbitrumSepolia.chainId,
    });
    console.log(usdtBalance)

    useEffect(() => {
        if (tickets && assetsInfo && balances) {
            const portfolio = tickets.map((ticket, index) => {
                const assetInfo = assetsInfo[index]?.result;
                const balance = balances[index]?.result || 0n;

                return {
                    ticket,
                    name: assetInfo?.name || "Unknown",
                    address: assetInfo?.assetAddress,
                    balance: balance.toString(),
                    uri: assetInfo?.uri,
                };
            }).filter(item => item.address); // Filter out invalid assets

            setPortfolioData(portfolio);
            setLoading(false);
        }
    }, [tickets, assetsInfo, balances]);

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-[#0E0B1C] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
                    <p className="text-gray-400">Connect your wallet to view your portfolio</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <Loader text={"Loading portfolio..."} />
        );
    }

    const totalAssets = portfolioData.filter(asset => BigInt(asset.balance) > 0n).length;

    return (
        <>
            <Header />

            <div className="min-h-screen bg-[#0E0B1C] p-6">
                <div className="max-w-6xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">My Portfolio 💼</h1>
                        <p className="text-gray-400">
                            Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                        <p className="text-gray-400 mt-1">
                            Balance: {usdtBalance?.data}
                        </p>
                    </div>




                    {portfolioData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No assets found in the protocol</p>
                        </div>
                    ) : (
                        <table className="w-full text-left rtl:text-right ">
                            <thead >
                                <tr className="text-[#5B6173]">
                                    <th scope="col" className="px-6 py-4">
                                        Asset
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Address
                                    </th>
                                    <th scope="col" className="px-6 py-4 hidden md:table-cell">
                                        Last Price
                                    </th>
                                    <th scope="col" className="px-6 py-4 hidden md:table-cell">
                                        Volume
                                    </th>

                                </tr>
                            </thead>

                            <tbody>
                                <tr
                                                className={`hover:bg-[#1E1C34] border-t-[1px] border-t-gray-600 transition duration-200  hover:cursor-pointer rounded-xl`}
                                                onClick={() => router.push(`/asset/${ticket}`)}
                                            >
                                                <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    <div className="flex items-center gap-4">
                                                         {/* <Image src={`https://ipfs.io/ipfs/${uri}`} width={25} height={25} alt={uri}/>  */}
                                                        <div className="flex items-start flex-col gap-1 justify-center">
                                                            <p className="">USDT</p> 
                                                            <p className="text-[#5B6173] text-sm">USDT</p>
                                                        </div>
                                                    </div>
                                                </th>
                                                <td>
                                                    200
                                                </td>
                                                <td className="px-6 py-4">
                                                    -
                                                </td>
                                                <td className="px-6 py-4 absolute hidden md:table-cell">
                                                        -
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    -
                                                </td>
                                            </tr>
                                {portfolioData.map((asset, index) => {
                                    return (
                                        <AssetComponentPortfolio
                                            key={index}
                                            balance={asset.balance}
                                            ticket={asset.ticket}
                                            assetAddress={asset.assetAddress}
                                            uri={asset.uri}
                                            id={asset.id}
                                            name={asset.name}
                                        />
                                    )
                                })}
                            </tbody>
                        </table>

                    )}
                </div>
            </div>

            <Footer />
        </>

    );
}