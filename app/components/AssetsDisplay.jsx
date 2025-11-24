"use client"
import AssetComponent from "./ui/AssetComponent";
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useDebouncedCallback } from 'use-debounce'
import { useState, useEffect, useMemo } from 'react'
import { useReadContract, useReadContracts } from "wagmi";
import assetPoolAbi from '../../abi/assetPool.json';

const ASSET_POOL_ADDRESS = "0xF0716eD7D975d82CCA4eD4AEAa43746842A4225F";

export default function AssetsDisplay() {
    const searchParams = useSearchParams()
    const pathName = usePathname()
    const { replace } = useRouter()
    const [param, setParam] = useState("")

    // Fetch all token tickets
    const { data: tickets, isLoading: ticketsLoading, isError: ticketsError } = useReadContract({
        address: ASSET_POOL_ADDRESS,
        abi: assetPoolAbi,
        functionName: "getAllTokenTickets",
    });

    // Create contract calls for each ticket to get asset info
    const assetInfoContracts = useMemo(() => {
        if (!tickets || tickets.length === 0) return [];
        
        return tickets.map((ticket) => ({
            address: ASSET_POOL_ADDRESS,
            abi: assetPoolAbi,
            functionName: "getAssetInfo",
            args: [ticket],
        }));
    }, [tickets]);

    // Batch read all asset info
    const { data: assetInfoData, isLoading: assetsLoading, isError: assetsError } = useReadContracts({
        contracts: assetInfoContracts,
        query: {
            enabled: !!tickets && tickets.length > 0,
        }
    });

    // Process the asset data
    const assets = useMemo(() => {
        if (!tickets || !assetInfoData) return [];

        return tickets.map((ticket, index) => {
            const result = assetInfoData[index];
            
            // Check if the read was successful
            if (result?.status !== 'success' || !result.result) {
                return null;
            }

            const assetInfo = result.result;
            
            return {
                ticket,
                assetAddress: assetInfo.assetAddress || assetInfo[0],
                id: assetInfo.id?.toString() || assetInfo[1]?.toString(),
                uri: assetInfo.uri || assetInfo[2],
                name: assetInfo.name || assetInfo[3]
            };
        }).filter(asset => asset !== null);
    }, [tickets, assetInfoData]);

    // Filter assets based on search
    const filteredAssets = useMemo(() => {
        const searchTerm = searchParams.get("search")?.toLowerCase() || param.toLowerCase();

        if (!searchTerm) {
            return assets;
        }

        return assets.filter(asset =>
            asset.ticket.toLowerCase().includes(searchTerm) ||
            asset.assetAddress.toLowerCase().includes(searchTerm) ||
            asset.name?.toLowerCase().includes(searchTerm)
        );
    }, [assets, param, searchParams]);

    const handleSearch = useDebouncedCallback((string) => {
        const params = new URLSearchParams(searchParams)
        setParam(string)
        if (string) {
            params.set("search", string)
        } else {
            params.delete("search")
        }
        replace(`${pathName}?${params.toString()}`)
    }, 300)

    const isLoading = ticketsLoading || assetsLoading;
    const hasError = ticketsError || assetsError;

    if (isLoading) {
        return (
            <div className="mt-20 w-[90%] m-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl">Loading assets...</div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="mt-20 w-[90%] m-auto">
                <div className="flex flex-col justify-center items-center h-64">
                    <div className="text-xl text-red-500 mb-4">Error loading assets</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-20">
            <div className="overflow-x-auto overflow-hidden mx-auto">
                <div className="mb-8">
                    <div className="p-1 hover:border-[#CECCF6] duration-300 bg-transparent border-[#303030] border-[1px] flex justify-between items-center w-[200px] md:w-[250px] xl:w-[350px] rounded-md py-1">
                        <input
                            defaultValue={searchParams.get("search")?.toString()}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder='Search for Assets'
                            className='py-1 px-2 border-none outline-none w-[85%] rounded-lg bg-transparent'
                        />
                    </div>
                </div>

                {filteredAssets.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {param || searchParams.get("search") 
                                ? `No assets found matching "${param || searchParams.get("search")}"` 
                                : 'No assets available'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left rtl:text-right">
                        <thead>
                            <tr className="text-[#5B6173]">
                                <th scope="col" className="px-6 py-4">
                                    Asset
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
                                <th scope="col" className="px-6 py-4 hidden md:table-cell">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAssets.map((asset) => (
                                <AssetComponent
                                    key={asset.ticket}
                                    param={param}
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
    )
}