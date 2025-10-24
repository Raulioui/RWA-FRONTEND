"use client"
import { useEffect, useState } from "react"
import Image from 'next/image'
import { fetchAssetData } from "../../../helpers/api.js"
import { formatVolume } from "../../../lib/formatters"
import { useRouter } from "next/navigation"

const AssetComponent = ({ name, ticket, image }) => {
    const router = useRouter();

    const [assetData, setAssetData] = useState([]);
    const [assetPrice, setAssetPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        const getData = async () => {
            const currentTime = new Date();
            const { totalVolume, res, assetPrice, priceChange } = await fetchAssetData(ticket, currentTime);

            setAssetData(res);
            setAssetPrice(assetPrice);
            setPriceChange(priceChange.toFixed(2));
            setVolume(formatVolume(totalVolume));
        }

        getData();
    }, [ticket])

    return (
        <div className="text-sm">
            <div
                className={`hover:bg-[#1E1C34] w-[300px]  sm:w-[450px] border-t-[1px] border-t-gray-600 transition duration-200 flex items-center justify-between gap-8  hover:cursor-pointer rounded-xl`}
                onClick={() => router.push(`/asset/${ticket}`)}
            >
                <div className="flex-1 min-w-0 px-4 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-4">
                        <Image src={image} width={25} height={25} alt={name} />

                        <div className="flex-1 min-w-0">
                            <p className=" whitespace-nowrap text-clip">{name}</p>
                            <p className="text-[#5B6173] text-sm">{ticket}</p>
                        </div>
                    </div>
                    </div>
                <div className="px-6 py-4">
                    <p className="">{Math.abs(assetPrice)}$</p>
                </div>
                <div className="px-6 py-4">
                    {priceChange < 0 ? (
                        <p className="text-[#C3719F]">{Math.abs(priceChange)}%</p>
                    ) : (
                        <p className="text-[#D4CAB7]">{Math.abs(priceChange)}%</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AssetComponent;