"use client"
import { formatCurrency } from "../../../lib/formatters";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useState } from "react";
import {fetchAssetData} from "../../../helpers/api.js"

export default function DayChart({id}) {
    const [data, setData] = useState([]);
    const [domain, setDomain] = useState([])
    
    useEffect(() => {
        const fetchStockData = async (timeNow) => {
            const {totalVolume, res, assetPrice, priceChange} = await fetchAssetData(id, timeNow);

            if (res?.bars === null || res?.bars.length < 3) {
                timeNow.setDate(timeNow.getDate() - 1);
                return fetchStockData(timeNow); 
            }

            const filteredData = res?.bars.filter(item => {
                const hour = new Date(item.t).getUTCHours();
                return hour >= 9 && hour <= 15;
            });

            const selectedDataReturned = filteredData.map(bar => {
                const date = new Date(bar.t);
                const formattedDate = `${date.getDate()} of ${date.toLocaleDateString("en-US", { month: "long" })}`;
                
                return {
                    value: bar.c, // Precio de cierre (close)
                    date: bar.t.split("T")[1].substring(0, 5)
                };
            });
            setData(selectedDataReturned);

            const values = selectedDataReturned.map(bar => bar.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);

            // Update the domain
            setDomain([Math.floor(minValue - 5), Math.floor(maxValue + 5)]);
        };

        const timeNow = new Date();
    
        fetchStockData(timeNow);
    }, []);

    if(data.length === 0 || domain.length === 0) {
        return <div className="h-[300px]"></div>
    } else return(
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}  >
                <XAxis dataKey="date" tick={{ fontSize: 14 }}/>
                <YAxis tickFormatter={tick => formatCurrency(tick)} domain={domain} tick={{ fontSize: 14 }}/>
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: "12px md:15px" }}/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false}/>
            </LineChart>
        </ResponsiveContainer>
    )
}