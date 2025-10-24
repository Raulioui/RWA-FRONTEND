"use client"
import { formatCurrency } from "../../../lib/formatters";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useState } from "react";
import {fetchAssetDataChart} from "../../../helpers/api.js"

export default function MonthChart({id}) {
    const [data, setData] = useState([]);
    const [domain, setDomain] = useState([])
    
    useEffect(() => {
        const fetchStockData = async (endDate, startDate) => {
            const res = await fetchAssetDataChart(id, endDate, startDate, "1Week", 5);

            const formattedData = res?.bars.map(bar => {
                const date = new Date(bar.t);
                const formattedDate = `${date.getDate()} of ${date.toLocaleDateString("en-US", { month: "long" })}`;
                
                return {
                    value: bar.c, // Precio de cierre (close)
                    date: formattedDate
                };
            });
            setData(formattedData);

            const values = formattedData.map(bar => bar.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);

            // Update the domain
            setDomain([Math.floor(minValue - 5), Math.floor(maxValue + 5)]);
        }

        const endDate = new Date();

        const startingDate = new Date();
        startingDate.setDate(startingDate.getDate() - 30); 

        fetchStockData(endDate, startingDate);
    }, []);

    if(data.length === 0 || domain.length === 0) {
        return <div className="h-[300px]"></div>
    } else return(
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} >
                <XAxis dataKey="date" tick={{ fontSize: 14 }}/>
                <YAxis tickFormatter={tick => formatCurrency(tick)} domain={domain} tick={{ fontSize: 14 }}/>
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: "12px md:15px" }}/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false}/>
            </LineChart>
        </ResponsiveContainer>
    )
}