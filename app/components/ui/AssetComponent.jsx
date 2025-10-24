"use client"
import {useEffect, useState} from "react"
import Image from 'next/image'
import up from "../../../public/up.svg"
import down from "../../../public/down.svg"
import SimpleAssetChart from "../../components/charts/SimpleAssetChart";
import Skeleton from '@mui/material/Skeleton';
import {fetchAssetData} from "../../../helpers/api.js"
import {formatVolume} from "../../../lib/formatters"
import { useRouter } from "next/navigation"

const AssetComponent = ({param, ticket, assetAddress, uri, id, name}) => {
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const [assetData, setAssetData] = useState([]);
    const [assetPrice, setAssetPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [volume, setVolume] = useState(0);
    
    useEffect(() => {
         const getData = async () => {
             const currentTime = new Date();
             const {totalVolume, res, assetPrice, priceChange} = await fetchAssetData(ticket, currentTime);

             setAssetData(res);
             setAssetPrice(assetPrice);
             setPriceChange(priceChange.toFixed(2));
             setVolume(formatVolume(totalVolume));
         }

         getData();
         setLoading(false);
    }, [ticket])

    const isEqualName = name.toLowerCase().includes(param?.toLowerCase())
    const isEqualTicket = ticket.toLowerCase().includes(param?.toLowerCase())
    const isEqual = isEqualName || isEqualTicket

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
                className={`hover:bg-[#1E1C34] ${isEqual ?  "" : "hidden"} border-t-[1px] border-t-gray-600 transition duration-200  hover:cursor-pointer rounded-xl`}
                onClick={() => router.push(`/asset/${ticket}`)}
            >
                <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div className="flex items-center gap-4">
                         <Image src={`https://ipfs.io/ipfs/${uri}`} width={25} height={25} alt={uri}/> 
                        <div className="flex items-start flex-col gap-1 justify-center">
                            <p className="">{name}</p> 
                            <p className="text-[#5B6173] text-sm">{ticket}</p>
                        </div>
                    </div>
                </th>
                <td className="px-6 py-4">
                    {assetPrice}$
                </td>
                <td className="px-6 py-4 absolute hidden md:table-cell">
                        {priceChange < 0 ? (
                            <div className="bg-[#4F3650] rounded-lg flex items-center gap-2 relative px-1 py-1 top-2 text-[#D4CAB7] font-medium w-[80px]">
                                <Image src={down} width={15} height={15} alt="priceDown"/>
                                <p className="text-[#C3719F]">{Math.abs(priceChange)}%</p>
                            </div>
                        ) : (
                            <div className="bg-[#4F4547] rounded-lg flex items-center gap-2 relative px-1 py-1 top-2 text-[#D4CAB7] font-medium w-[80px]">
                                <Image src={up} width={15} height={15} alt="priceUp"/>
                                {priceChange}%
                            </div>
                        )}
                </td>
                <td class="px-6 py-4 hidden md:table-cell">
                    {volume}
                </td>
                <td class="px-6 py-4 hidden md:table-cell">
                    <SimpleAssetChart chart={assetData}/>
                </td>
            </tr>
        )}
        </>
    )
}

export default AssetComponent;