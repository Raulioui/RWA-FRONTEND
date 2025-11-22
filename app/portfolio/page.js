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
                            Total Assets: {totalAssets}
                        </p>
                    </div>


                    {portfolioData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No assets found in the protocol</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <p>Usdt balance: {usdtBalance?.data}</p>
                            </div>
                            {portfolioData.map((asset, index) => {
                                const hasBalance = BigInt(asset.balance) > 0n;
                                const formattedBalance = (Number(asset.balance) / 1e18).toFixed(4);

                                return (
                                    <div
                                        key={index}
                                        className={`bg-[#1E1C34] border rounded-2xl p-6 transition-all ${hasBalance
                                                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                                                : 'border-gray-700 opacity-60'
                                            }`}
                                    >
                                        {/* Asset Image */}
                                        {asset.uri && (
                                            <div className="w-full h-40 bg-[#0E0B1C] rounded-lg mb-4 flex items-center justify-center">
                                                <img
                                                    src={`https://ipfs.io/ipfs/${asset.uri}`}
                                                    alt={asset.name}
                                                    className="max-h-full max-w-full object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Asset Info */}
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">{asset.name}</h3>
                                            <p className="text-sm text-gray-400 mb-3">{asset.ticket}</p>

                                            {/* Balance */}
                                            <div className="bg-[#0E0B1C] rounded-lg p-3 mb-3">
                                                <p className="text-xs text-gray-400 mb-1">Balance</p>
                                                <p className={`text-2xl font-bold ${hasBalance ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {formattedBalance}
                                                </p>
                                            </div>

                                            {/* Contract Address */}
                                            <div className="text-xs text-gray-500">
                                                <p>Contract:</p>
                                                <p className="font-mono truncate">
                                                    {asset.address?.slice(0, 10)}...{asset.address?.slice(-8)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            <Footer/>
        </>

    );
}