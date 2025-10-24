"use client"
import AssetComponent from "./ui/AssetComponent";
import {useSearchParams, usePathname, useRouter} from "next/navigation"
import {useDebouncedCallback} from 'use-debounce'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import assetPoolAbi from '../../abi/assetPool.json'; 

export default function AssetsDisplay() {
    const searchParams = useSearchParams()
    const pathName = usePathname()
    const {replace} = useRouter()
    const [param, setParam] = useState("")
    
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filteredAssets, setFilteredAssets] = useState([])

    useEffect(() => {
        async function getData() {
            try {
                setLoading(true)
                setError(null)
                
                const provider = new ethers.JsonRpcProvider('https://arb-sepolia.g.alchemy.com/v2/ieYm8d748qFp12e9B0YO0haOD15fxPJo');
                const contractAddress = '0xCcbd04Ff2B9613B5bB12755BE4E86f72734D9cfC';
                
                // Make sure ABI is properly accessed
                const abi = assetPoolAbi.abi || assetPoolAbi; // Handle both formats
                const assetPoolContract = new ethers.Contract(contractAddress, abi, provider);

                // Get all asset tickets (returns array of strings)
                const tickets = await assetPoolContract.getAllTokenTickets();

                const assetsWithInfo = await Promise.all(
                    tickets.map(async (ticket) => {
                        try {
                            const assetInfo = await assetPoolContract.getAssetInfo(ticket);
                            return {
                                ticket,
                                assetAddress: assetInfo.assetAddress,
                                id: assetInfo.id.toString(),
                                uri: assetInfo.uri,
                                name: assetInfo.name  
                            };
                        } catch (err) {
                            console.error(`Error fetching info for ticket ${ticket}:`, err);
                            return null;
                        }
                    })
                );

                const validAssets = assetsWithInfo.filter(asset => asset !== null);
                
                setAssets(validAssets);
                setFilteredAssets(validAssets);
            } catch (error) {
                console.error('Error fetching assets:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        getData()
    }, [])

    useEffect(() => {
        const searchTerm = searchParams.get("search")?.toLowerCase() || param.toLowerCase();
        
        if (!searchTerm) {
            setFilteredAssets(assets);
        } else {
            const filtered = assets.filter(asset => 
                asset.ticket.toLowerCase().includes(searchTerm) ||
                asset.assetAddress.toLowerCase().includes(searchTerm)
            );
            setFilteredAssets(filtered);
        }
    }, [assets, param, searchParams]);

    const handleSearch = useDebouncedCallback((string) => {
        const params = new URLSearchParams(searchParams)
        setParam(string)
        if(string) {
            params.set("search", string)
        } else {
            params.delete("search")
        }
        replace(`${pathName}?${params.toString()}`)
    }, 300) 

    const handleRetry = () => {
        setLoading(true);
        setError(null);
    };

    if (loading) {
        return (
            <div className="mt-20 w-[90%] m-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl">Loading assets...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-20 w-[90%] m-auto">
                <div className="flex flex-col justify-center items-center h-64">
                    <div className="text-xl text-red-500 mb-4">Error loading assets: {error}</div>
                    <button 
                        onClick={handleRetry}
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
            <div className="overflow-x-auto  overflow-hidden mx-auto">
                <div className="mb-8">
                    <div className="p-1 hover:border-[#CECCF6] duration-300  bg-transparent border-[#303030] border-[1px] flex justify-between items-center w-[200px] md:w-[250px] xl:w-[350px] rounded-md py-1"> 
                        <input 
                            defaultValue={searchParams.get("search")?.toString()} 
                            onChange={(e) => handleSearch(e.target.value)} 
                            placeholder='Search for Assets' 
                            className='py-1 px-2  border-none outline-none w-[85%]  rounded-lg bg-transparent'
                        />
                    </div>
                </div>
                
                {filteredAssets.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {param ? `No assets found matching "${param}"` : 'No assets available'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left rtl:text-right ">
                        <thead >
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
                            {filteredAssets.map((asset) => {
                                return (
                                    <AssetComponent 
                                        key={asset.ticket}
                                        param={param} 
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
    )
}