"use client"
import {useEffect, useState} from "react"
import Image from 'next/image'
import up from "../../../public/up.svg"
import down from "../../../public/down.svg"
import Skeleton from '@mui/material/Skeleton';
import {fetchAssetData} from "../../../helpers/api.js"
import {formatVolume} from "../../../lib/formatters"
import { useRouter } from "next/navigation"

export default function AssetComponentPortfolio({balance, ticket, assetAddress, uri, id, name}) {
    const [loading, setLoading] = useState(true);

    console.log(ticket)

    const router = useRouter();

    const [assetData, setAssetData] = useState([]);
    const [assetPrice, setAssetPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [value, setValue] = useState(0);
    
    useEffect(() => {
         const getData = async () => {
             const currentTime = new Date();
             const {totalVolume, res, assetPrice, priceChange} = await fetchAssetData(ticket, currentTime);

             setAssetData(res);
             setAssetPrice(assetPrice);
             setPriceChange(priceChange.toFixed(2));
             setValue((assetPrice * (balance / 10 ** 18)).toFixed(2));
         }

         getData();
         setLoading(false);
    }, [ticket])

    // Add return statement here!
    if (BigInt(balance) <= 0) {
        return null; // Don't render anything if balance is 0
    }

    return (
        <>
            {loading ? (
                <tr>
                    <th>
                        <Skeleton className='my-2 bg-[#1E1C34]' variant="rectangular" width="100%" height={70}  />
                    </th>
                    <td>
                        <Skeleton className='my-2 bg-[#1E1C34]' variant="rectangular" width="100%" height={70}  />
                    </td>
                    <td>
                        <Skeleton className='my-2 bg-[#1E1C34]' variant="rectangular" width="100%" height={70}  />
                    </td>
                    <td>
                        <Skeleton className='my-2 bg-[#1E1C34]' variant="rectangular" width="100%" height={70}  />
                    </td>
                    <td>
                        <Skeleton className='my-2 bg-[#1E1C34]' variant="rectangular" width="100%" height={70}  />
                    </td>
                </tr>
            ) : (
                <tr
                    className={`hover:bg-[#1E1C34] border-t-[1px] border-t-gray-600 transition duration-200  hover:cursor-pointer rounded-xl`}
                    onClick={() => router.push(`/asset/${ticket}`)}
                >
                    <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <div className="flex items-center gap-4">
             
                            <div className="flex items-start flex-col gap-1 justify-center">
                                <p className="">{name}</p> 
                                <p className="text-[#5B6173] text-sm">{ticket}</p>
                            </div>
                        </div>
                    </th>
                    <td className="px-6 py-4">
                        {(balance / 10 ** 18).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                        {`${assetAddress?.slice(0, 6)}...${assetAddress?.slice(-4)}`}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                        {assetPrice}$
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                        {value}$
                    </td>
                </tr>
            )}
        </>
    );
}
