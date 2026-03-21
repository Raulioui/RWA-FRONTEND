"use client";

import { DollarSign, Volume2 } from "lucide-react";
import StatCard from "./ui/StatCard";

export default function AssetStatistics({ assetDetails, ticket }) {
  const data = {
    priceChange: assetDetails?.priceChange ?? 0,
    hightPrice: assetDetails?.hightPrice ?? 0,
    lowPrice: assetDetails?.lowPrice ?? 0,
    totalVolume: assetDetails?.totalVolume ?? 0,
  };

  const isPositive = data.priceChange >= 0;

  const formatVolume = (vol) => {
    if (!vol) return "0";
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };

  return (
    <div className="text-white">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-4xl mb-8">Statistics</h2>
        {ticket ? (
          <div className="text-sm text-gray-400">
            Asset: <span className="text-gray-200 font-semibold">{ticket}</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="24h Change"
          value={`${isPositive ? "+" : ""}${data.priceChange.toFixed(2)}%`}
          trend={data.priceChange}
        />

        <StatCard
          icon={DollarSign}
          label="24h High"
          value={`$${data.hightPrice.toFixed(2)}`}
        />

        <StatCard
          icon={DollarSign}
          label="24h Low"
          value={`$${data.lowPrice.toFixed(2)}`}
        />

        <StatCard
          icon={Volume2}
          label="24h Volume"
          value={formatVolume(data.totalVolume)}
        />
      </div>
    </div>
  );
}
