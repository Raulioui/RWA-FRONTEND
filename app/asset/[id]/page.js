"use client"
import Image from 'next/image'
import Header from "../../components/Header";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useEffect, useState } from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DayChart from "../../components/charts/DayChart";
import WeekChart from "../../components/charts/WeekChart"
import { use } from 'react';
import MonthChart from "../../components/charts/MonthChart"
import { useRouter } from "next/navigation";
import { fetchCurrentPrice } from "../../../helpers/api";
import AssetExchange from "../../components/ui/AssetExchange";
import OneYearChart from "../../components/charts/1YearChart";
import ThreeYearsChart from "../../components/charts/3YearsChart";
import Footer from "../../components/Footer";
import { fetchAssetDetails } from "../../../helpers/api";
import { ethers } from 'ethers';
import assetPoolAbi from '../../../abi/assetPool.json';

function CustomTabPanel(props) {
    const { children, value, index } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export default function page({ params }) {
    const { id } = use(params)

    const router = useRouter()

    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState(0);
    const [assetPrice, setAssetPrice] = useState(0);
    const [assetDetails, setAssetDetails] = useState({});
    const [token, setToken] = useState(null);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        async function getData() {
            try {
                setLoading(true);

                const provider = new ethers.JsonRpcProvider('https://arb-sepolia.g.alchemy.com/v2/ieYm8d748qFp12e9B0YO0haOD15fxPJo');
                const contractAddress = '0x042755c9709051eBD4a2EAA73065B09838e5e8D0';

                const abi = assetPoolAbi.abi || assetPoolAbi;
                const assetPoolContract = new ethers.Contract(contractAddress, abi, provider);

                const assetInfo = await assetPoolContract.getAssetInfo(id);
                console.log('All tickets:', assetInfo);

                const tokenData = {
                    ticket: id,
                    assetAddress: assetInfo.assetAddress,
                    id: assetInfo.id.toString(),
                    uri: assetInfo.uri,
                    name: assetInfo.name
                };

                setToken(tokenData);

                const assetPrice = await fetchCurrentPrice(id);
                const { hightPrice, lowPrice, priceChange, totalVolume } = await fetchAssetDetails(id);

                setAssetDetails({
                    hightPrice,
                    lowPrice,
                    priceChange,
                    totalVolume
                });

                setAssetPrice(assetPrice);

            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        }
        getData();
    }, [id, router]);


    if (loading) return (
        <div>
            <span className="loading loading-ring loading-xs"></span>
        </div>
    );

    return (
        <>
            <Header />

            <div className="w-[90%] flex justify-center gap-12 mx-auto items-start mt-12 lg:w-[70%] p-8 rounded-lg">

                <div className='w-[60%]'>
                    <div className="flex flex-col items-start gap-8 md:flex-row md:justify-between mb-8">
                        <div className="flex flex-col gap-4 justify-start">
                            <Image src={`https://ipfs.io/ipfs/${token?.uri}`} width={50} height={50} alt={token?.uri} />
                            <h2 className="text-xl">{assetPrice}$</h2>
                        </div>

                        <Box>
                            <Tabs
                                textColor="white"
                                indicatorColor="primary"
                                value={value} onChange={handleChange}
                                aria-label="basic tabs example"
                                sx={{
                                    "& .MuiTabs-indicator": { backgroundColor: "#CECCF6", },
                                    "& .MuiTab-root": { color: "#5B6173", minWidth: "auto", paddingRight: "20px" },
                                    "& .Mui-selected": { color: "#CECCF6", fontWeight: "bold" },
                                }}>
                                <Tab label="24 H" className="text-xs md:text-sm" sx={{ fontSize: "0.75rem", "@media (min-width: 768px)": { fontSize: "0.875rem" } }} />
                                <Tab label="1 W" className="text-xs md:text-sm" />
                                <Tab label="1 M" className="text-xs md:text-sm" />
                                <Tab label="1 Y" className="text-xs md:text-sm" />
                                <Tab label="3 Y" className="text-xs md:text-sm" />
                            </Tabs>
                        </Box>

                    </div>



                    <div>
                        <CustomTabPanel value={value} index={0}>
                            <DayChart id={id} />
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={1}>
                            <WeekChart id={id} />
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={2}>
                            <MonthChart id={id} />
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={3}>
                            <OneYearChart id={id} />
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={4}>
                            <ThreeYearsChart id={id} />
                        </CustomTabPanel>
                    </div>
                </div>

                <div className='w-[40%]'>
                    <AssetExchange ticket={id} price={assetPrice} token={token} loading={loading} assetDetails={assetDetails} />
                </div>

            </div>

            <Footer />
        </>
    );
}

