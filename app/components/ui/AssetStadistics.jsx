// components/ui/AssetStatistics.jsx
"use client"
import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Volume2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AssetStatistics({ assetDetails, ticket }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Safely access properties with defaults
    const data = {
        priceChange: assetDetails?.priceChange || 0,
        hightPrice: assetDetails?.hightPrice || 0,
        lowPrice: assetDetails?.lowPrice || 0,
        totalVolume: assetDetails?.totalVolume || 0,
        openingPrice: assetDetails?.openingPrice || 0,
        closingPrice: assetDetails?.closingPrice || 0,
        avgPrice: assetDetails?.avgPrice || 0,
        dailyVolume: assetDetails?.dailyVolume || 0,
        avgVolume: assetDetails?.avgVolume || 0,
        volatility: assetDetails?.volatility || 0,
        volatilityPercent: assetDetails?.volatilityPercent || 0,
        vwap: assetDetails?.vwap || 0,
        momentum: assetDetails?.momentum || 0,
        momentumPercent: assetDetails?.momentumPercent || 0,
        sma5: assetDetails?.sma5 || 0,
        sma10: assetDetails?.sma10 || 0,
        rsi: assetDetails?.rsi || 50,
        positiveBars: assetDetails?.positiveBars || 0,
        negativeBars: assetDetails?.negativeBars || 0,
        bidPrice: assetDetails?.bidPrice || 0,
        askPrice: assetDetails?.askPrice || 0,
        spread: assetDetails?.spread || 0,
        spreadPercent: assetDetails?.spreadPercent || 0,
        priceRange: assetDetails?.priceRange || 0,
        priceRangePercent: assetDetails?.priceRangePercent || 0,
        dayOverDayChange: assetDetails?.dayOverDayChange || 0,
    };

    const isPositive = data.priceChange >= 0;

    const formatVolume = (vol) => {
        if (!vol) return '0';
        if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
        if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
        if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
        return vol.toString();
    };

    const StatCard = ({ icon: Icon, label, value, subtitle, trend }) => (
        <div className="bg-[#1E1C34] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-[#2A2845] rounded-lg">
                    <Icon className="w-5 h-5 text-blue-400" />
                </div>
                {trend !== undefined && trend !== null && (
                    <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{Math.abs(trend).toFixed(2)}%</span>
                    </div>
                )}
            </div>
            <div className="text-gray-400 text-sm mb-1">{label}</div>
            <div className="text-white text-2xl font-semibold mb-1">{value}</div>
            {subtitle && <div className="text-gray-500 text-xs">{subtitle}</div>}
        </div>
    );

    return (
        <div className="text-white">

            <div className="mb-6">
                <h2 className="text-2xl lg:text-4xl mb-12">Statistics</h2>
                
                <div className="flex gap-4 border-b border-gray-700">
                    {['overview', 'technical', 'volume'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-4 font-medium capitalize transition-colors ${
                                activeTab === tab
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={DollarSign}
                            label="24h Change"
                            value={`${isPositive ? '+' : ''}${data.priceChange.toFixed(2)}%`}
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
                            subtitle={data.dailyVolume ? `Daily: ${formatVolume(data.dailyVolume)}` : ''}
                        />
                    </div>

                    {/* Price Range Visualization */}
                    {data.priceRange > 0 && (
                        <div className="bg-[#1E1C34] rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4">24h Price Range</h3>
                            <div className="relative">
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span>Low: ${data.lowPrice.toFixed(2)}</span>
                                    <span>High: ${data.hightPrice.toFixed(2)}</span>
                                </div>
                                <div className="w-full h-2 bg-[#2A2845] rounded-full relative overflow-hidden">
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                                        style={{ 
                                            left: '0%',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                                <div className="flex justify-center mt-2">
                                    <span className="text-sm text-gray-400">
                                        Range: ${data.priceRange.toFixed(2)} ({data.priceRangePercent.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price Metrics */}
                    {(data.openingPrice > 0 || data.avgPrice > 0 || data.vwap > 0) && (
                        <div className="bg-[#1E1C34] rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-blue-400" />
                                Price Metrics
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {data.openingPrice > 0 && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Open</div>
                                        <div className="text-white text-lg font-semibold">${data.openingPrice.toFixed(2)}</div>
                                    </div>
                                )}
                                {data.closingPrice > 0 && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Close</div>
                                        <div className="text-white text-lg font-semibold">${data.closingPrice.toFixed(2)}</div>
                                    </div>
                                )}
                                {data.avgPrice > 0 && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Avg Price</div>
                                        <div className="text-white text-lg font-semibold">${data.avgPrice.toFixed(2)}</div>
                                    </div>
                                )}
                                {data.vwap > 0 && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">VWAP</div>
                                        <div className="text-white text-lg font-semibold">${data.vwap.toFixed(2)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Market Depth */}
                    {(data.bidPrice > 0 || data.askPrice > 0) && (
                        <div className="bg-[#1E1C34] rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4">Market Depth</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">Bid</div>
                                    <div className="text-white text-lg font-semibold">${data.bidPrice.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">Ask</div>
                                    <div className="text-white text-lg font-semibold">${data.askPrice.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">Spread</div>
                                    <div className="text-white text-lg font-semibold">${data.spread.toFixed(2)}</div>
                                    <div className="text-gray-500 text-xs">{data.spreadPercent.toFixed(3)}%</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">Liquidity</div>
                                    <div className="text-green-400 text-lg font-semibold">
                                        {data.spreadPercent < 0.1 ? 'High' : 'Moderate'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Technical Tab */}
            {activeTab === 'technical' && (
                <div className="space-y-6">
                    {(data.rsi > 0 || data.sma5 > 0 || data.sma10 > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {data.rsi > 0 && (
                                <StatCard
                                    icon={Activity}
                                    label="RSI (14)"
                                    value={data.rsi.toFixed(2)}
                                    subtitle={data.rsi > 70 ? 'Overbought' : data.rsi < 30 ? 'Oversold' : 'Neutral'}
                                />
                            )}
                            {data.sma5 > 0 && (
                                <StatCard
                                    icon={TrendingUp}
                                    label="SMA 5"
                                    value={`$${data.sma5.toFixed(2)}`}
                                />
                            )}
                            {data.sma10 > 0 && (
                                <StatCard
                                    icon={TrendingUp}
                                    label="SMA 10"
                                    value={`$${data.sma10.toFixed(2)}`}
                                />
                            )}
                        </div>
                    )}

                    {/* Momentum & Trend */}
                    {(data.momentum !== 0 || data.positiveBars > 0 || data.negativeBars > 0) && (
                        <div className="bg-[#1E1C34] rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" />
                                Momentum & Trend
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {data.momentum !== 0 && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Momentum</div>
                                        <div className="text-white text-lg font-semibold">${data.momentum.toFixed(2)}</div>
                                        <div className={`text-sm ${data.momentumPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {data.momentumPercent >= 0 ? '+' : ''}{data.momentumPercent.toFixed(2)}%
                                        </div>
                                    </div>
                                )}
                                {data.positiveBars > 0 && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Positive Bars</div>
                                        <div className="text-green-400 text-lg font-semibold">{data.positiveBars}</div>
                                        <div className="text-gray-500 text-xs">
                                            {((data.positiveBars / (data.positiveBars + data.negativeBars)) * 100).toFixed(0)}% bullish
                                        </div>
                                    </div>
                                )}
                                {data.negativeBars > 0 && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Negative Bars</div>
                                        <div className="text-red-400 text-lg font-semibold">{data.negativeBars}</div>
                                        <div className="text-gray-500 text-xs">
                                            {((data.negativeBars / (data.positiveBars + data.negativeBars)) * 100).toFixed(0)}% bearish
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Trend Visualization */}
                            {(data.positiveBars > 0 || data.negativeBars > 0) && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-gray-400 text-sm">Trend Strength</div>
                                    </div>
                                    <div className="w-full h-4 bg-[#2A2845] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                            style={{ width: `${(data.positiveBars / (data.positiveBars + data.negativeBars)) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>Bearish</span>
                                        <span>Bullish</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* RSI Gauge */}
                    {data.rsi > 0 && (
                        <div className="bg-[#1E1C34] rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4">RSI Indicator</h3>
                            <div className="relative h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-gray-900 shadow-lg"
                                    style={{ left: `${data.rsi}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                                <span>0 (Oversold)</span>
                                <span>50 (Neutral)</span>
                                <span>100 (Overbought)</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Volume Tab */}
            {activeTab === 'volume' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={Volume2}
                            label="Total Volume (24h)"
                            value={formatVolume(data.totalVolume)}
                            subtitle="Hourly aggregated"
                        />
                        {data.dailyVolume > 0 && (
                            <StatCard
                                icon={Volume2}
                                label="Daily Volume"
                                value={formatVolume(data.dailyVolume)}
                            />
                        )}
                        {data.avgVolume > 0 && (
                            <StatCard
                                icon={Volume2}
                                label="Avg Volume/Bar"
                                value={formatVolume(data.avgVolume)}
                                subtitle="Per hour average"
                            />
                        )}
                    </div>

                    {/* Volume Analysis */}
                    {data.avgVolume > 0 && (
                        <div className="bg-[#1E1C34] rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                Volume Analysis
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Volume vs Average</span>
                                    <span className={`font-semibold ${data.dailyVolume > data.avgVolume ? 'text-green-400' : 'text-red-400'}`}>
                                        {((data.dailyVolume / data.avgVolume - 1) * 100).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-[#2A2845] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${data.dailyVolume > data.avgVolume ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min((data.dailyVolume / data.avgVolume) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}