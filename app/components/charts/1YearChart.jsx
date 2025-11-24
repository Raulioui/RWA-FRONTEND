"use client"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useState } from "react";
import {fetchAssetDataChart} from "../../../helpers/api.js"

export default function OneYearChart({id}) {
    const [data, setData] = useState([]);
    const [domain, setDomain] = useState([])
    
    useEffect(() => {
        const fetchStockData = async (endDate, startDate) => {
            const res = await fetchAssetDataChart(id, endDate, startDate, "1Month", 12);
         
            const selectedIndexes = [0, 3, 6, 9, res?.bars.length - 1].filter(i => i < res?.bars.length);
            const selectedBars = selectedIndexes.map(i => res?.bars[i]);

            const formattedData = selectedBars.map(bar => {
                const date = new Date(bar.t);
                const formattedDate = `${date.getDate()} of ${date.toLocaleDateString("en-US", { month: "long" })}`;
                
                return {
                    value: bar.c, 
                    date: formattedDate
                };
            });
            setData(formattedData);
            console.log("Formatted Data:", formattedData);

            const values = formattedData.map(bar => bar.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);

            // Update the domain
            setDomain([Math.floor(minValue - 5), Math.floor(maxValue + 5)]);
        }

        const endDate = new Date();

        const startingDate = new Date();
        startingDate.setDate(startingDate.getDate() - 365); 

        fetchStockData(endDate, startingDate);
    }, []);

    if(data.length === 0 || domain.length === 0) {
        return <div className="h-[300px]"></div>
    } else return(
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} >
     p09ouo
                <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false}/>
            </LineChart>
        </ResponsiveContainer>
    )
}