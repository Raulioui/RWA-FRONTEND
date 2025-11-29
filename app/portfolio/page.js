'use client';

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { arbitrumSepolia } from 'wagmi/chains';
import assetPoolAbi from "../../abi/assetPool.json";
import assetAbi from "../../abi/assetAbi.json";
import usdtAbi from '../../abi/usdtAbi.json';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/ui/Loader";
import AssetComponentPortfolio from "../components/ui/AssetComponentPortfolio";

const ASSET_POOL_ADDRESS = "0x549746c116153aFA22c4A1927E9DD4Cb30A26797";
const USDT_ADDRESS = "0x80Efc4Bcb5797a952943512b10c1595aCdE821cC";

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

    const { data: usdtBalance } = useReadContract({
        address: USDT_ADDRESS,
        abi: usdtAbi,
        functionName: "balanceOf",
        args: [address],
        chainId: arbitrumSepolia.chainId,
    });

    useEffect(() => {
        if (tickets && assetsInfo && balances) {
            const portfolio = tickets.map((ticket, index) => {
                const assetInfo = assetsInfo[index]?.result;
                const balance = balances[index]?.result || 0n;

                return {
                    ticket,
                    name: assetInfo?.name || "Unknown",
                    assetAddress: assetInfo?.assetAddress,
                    balance: balance.toString(),
                    uri: assetInfo?.uri,
                };
            }).filter(item => item.assetAddress);

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

    const usdtBalanceFormatted = usdtBalance ? (Number(usdtBalance) / 10 ** 6).toFixed(2) : "0.00";

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
                            USDT Balance: {usdtBalanceFormatted} USDT
                        </p>
                    </div>

                    {portfolioData.length === 0 && BigInt(usdtBalance || 0) === 0n ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No assets found in the protocol</p>
                        </div>
                    ) : (
                        <table className="w-full text-left rtl:text-right">
                            <thead>
                                <tr className="text-[#5B6173]">
                                    <th scope="col" className="px-6 py-4">
                                        Asset
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-4 hidden md:table-cell">
                                        Address
                                    </th>
                                    <th scope="col" className="px-6 py-4 hidden md:table-cell">
                                        Last Price
                                    </th>
                                    <th scope="col" className="px-6 py-4 hidden md:table-cell">
                                        Value
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {/* USDT Row */}
                                {BigInt(usdtBalance || 0) > 0n && (
                                    <tr className="hover:bg-[#1E1C34] border-t-[1px] border-t-gray-600 transition duration-200">
                                        <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-start flex-col gap-1 justify-center">
                                                    <p className="">USDT</p>
                                                    <p className="text-[#5B6173] text-sm">Tether USD</p>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">
                                            {usdtBalanceFormatted}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {`${USDT_ADDRESS.slice(0, 6)}...${USDT_ADDRESS.slice(-4)}`}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            1.00$
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {usdtBalanceFormatted}$
                                        </td>
                                    </tr>
                                )}

                                {/* Asset Rows */}
                                {portfolioData?.map((asset, index) => (
                                    <AssetComponentPortfolio
                                        key={index}
                                        balance={asset.balance}
                                        ticket={asset.ticket}
                                        assetAddress={asset.assetAddress}
                                        uri={asset.uri}
                                        id={asset.id}
                                        name={asset.name}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}