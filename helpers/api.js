async function alpacaMarketGet(url) {
  const r = await fetch(`/api/alpaca/market/bars?url=${encodeURIComponent(url)}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}


export const fetchAssetDetails = async (ticket) => {
  const currentTime = new Date()
    const formatCurrentTime = currentTime.toISOString().split('T')[0];
    
    try {
        // Fetch multiple endpoints in parallel for better performance
        const barsUrl = `https://data.alpaca.markets/v2/stocks/${ticket}/bars?timeframe=1Hour&start=${formatCurrentTime}T00%3A00%3A00Z&limit=24&adjustment=raw&feed=sip&sort=asc`;
        const snapUrl = `https://data.alpaca.markets/v2/stocks/${ticket}/snapshot`;

        const [barsData, snapshotData] = await Promise.all([
        fetch(`/api/alpaca/market/bars?url=${encodeURIComponent(barsUrl)}`).then(r => r.json()),
        fetch(`/api/alpaca/market/bars?url=${encodeURIComponent(snapUrl)}`).then(r => r.json()).catch(() => ({}))
        ]);

        // Handle bars recursion if needed
        if (barsData.bars === null || barsData.bars.length <= 1) {
            currentTime.setDate(currentTime.getDate() - 1);
            return fetchAssetDetails(ticket, currentTime);
        }

        const bars = barsData.bars;
        const lastBar = bars[bars.length - 1];
        
        // === BASIC PRICE METRICS ===
        const openingPrice = bars[0].o;
        const closingPrice = lastBar.c;
        const priceChange = ((closingPrice - openingPrice) / openingPrice) * 100;
        
        const hightPrice = Math.max(...bars.map(bar => bar.h));
        const lowPrice = Math.min(...bars.map(bar => bar.l));
        const priceRange = hightPrice - lowPrice;
        const priceRangePercent = (priceRange / openingPrice) * 100;

        // === VOLUME METRICS ===
        const totalVolume = bars.reduce((sum, bar) => sum + bar.v, 0);
        const avgVolume = totalVolume / bars.length;
        
        // === PRICE AVERAGES ===
        const avgPrice = bars.reduce((sum, bar) => sum + bar.c, 0) / bars.length;
        
        // === VOLATILITY ===
        const variance = bars.reduce((sum, bar) => Math.pow(bar.c - avgPrice, 2) + sum, 0) / bars.length;
        const volatility = Math.sqrt(variance);
        const volatilityPercent = (volatility / avgPrice) * 100;

        // === VWAP (Volume Weighted Average Price) ===
        const vwap = bars.reduce((sum, bar) => {
            const typicalPrice = (bar.h + bar.l + bar.c) / 3;
            return sum + (typicalPrice * bar.v);
        }, 0) / totalVolume;

        // === MOMENTUM ===
        const currentPrice = closingPrice;
        const momentum = currentPrice - avgPrice;
        const momentumPercent = (momentum / avgPrice) * 100;

        // === TREND INDICATORS ===
        const positiveBars = bars.filter((bar, i) => i > 0 && bar.c > bars[i-1].c).length;
        const negativeBars = bars.filter((bar, i) => i > 0 && bar.c < bars[i-1].c).length;

        // === SNAPSHOT DATA ===
        const dailyBar = snapshotData.dailyBar || {};
        const prevDailyBar = snapshotData.prevDailyBar || {};
        const latestQuote = snapshotData.latestQuote || {};
        
        // Daily metrics
        const dailyVolume = dailyBar.v || 0;
        
        // Day-over-day change
        const prevClose = prevDailyBar.c || 0;
        const dayOverDayChange = prevClose ? ((closingPrice - prevClose) / prevClose) * 100 : 0;
        
        // === BID-ASK SPREAD ===
        const bidPrice = latestQuote.bp || 0;
        const askPrice = latestQuote.ap || 0;
        const spread = askPrice - bidPrice;
        const spreadPercent = bidPrice ? (spread / bidPrice) * 100 : 0;

        // === MOVING AVERAGES ===
        const sma5 = bars.length >= 5 
            ? bars.slice(-5).reduce((sum, bar) => sum + bar.c, 0) / 5 
            : 0;
        const sma10 = bars.length >= 10 
            ? bars.slice(-10).reduce((sum, bar) => sum + bar.c, 0) / 10 
            : 0;
        
        // === RSI (Relative Strength Index - 14 period) ===
        let rsi = null;
        if (bars.length >= 14) {
            const changes = bars.slice(1).map((bar, i) => bar.c - bars[i].c);
            const gains = changes.map(c => c > 0 ? c : 0);
            const losses = changes.map(c => c < 0 ? -c : 0);
            
            const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / 14;
            const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / 14;
            
            if (avgLoss !== 0) {
                const rs = avgGain / avgLoss;
                rsi = 100 - (100 / (1 + rs));
            } else {
                rsi = 100;
            }
        }

        return {
            // Basic price metrics
            priceChange,
            hightPrice,
            lowPrice,
            openingPrice,
            closingPrice,
            
            // Price statistics
            avgPrice,
            priceRange,
            priceRangePercent,
            
            // Volume
            totalVolume,
            avgVolume,
            dailyVolume,
            
            // Volatility
            volatility,
            volatilityPercent,
            
            // Technical indicators
            vwap,
            momentum,
            momentumPercent,
            sma5,
            sma10,
            rsi,
            
            // Trend
            positiveBars,
            negativeBars,
            
            // Daily metrics
            dayOverDayChange,
            
            // Market depth
            bidPrice,
            askPrice,
            spread,
            spreadPercent,
        };
    } catch (error) {
        console.error('Error fetching asset details:', error);
        // Return safe defaults if fetch fails
        return {
            priceChange: 0,
            hightPrice: 0,
            lowPrice: 0,
            totalVolume: 0,
            openingPrice: 0,
            closingPrice: 0,
            avgPrice: 0,
            dailyVolume: 0,
            avgVolume: 0,
            volatility: 0,
            volatilityPercent: 0,
            vwap: 0,
            momentum: 0,
            momentumPercent: 0,
            sma5: 0,
            sma10: 0,
            rsi: 50,
            positiveBars: 0,
            negativeBars: 0,
            bidPrice: 0,
            askPrice: 0,
            spread: 0,
            spreadPercent: 0,
            priceRange: 0,
            priceRangePercent: 0,
            dayOverDayChange: 0,
        };
    }
};


export const fetchAssetData = async (ticket, currentTime) => {
  const formatCurrentTime = currentTime.toISOString().split("T")[0];

  try {
    const url = `https://data.alpaca.markets/v2/stocks/${ticket}/bars?timeframe=1Hour&start=${formatCurrentTime}T00%3A00%3A00Z&limit=24&adjustment=raw&feed=sip&sort=asc`;

    const res = await alpacaMarketGet(url);

    if (res.bars === null || res.bars.length === 1) {
      currentTime.setDate(currentTime.getDate() - 1);
      return fetchAssetData(ticket, currentTime);
    }

    const assetPrice = res?.bars?.[res.bars.length - 1]?.c ?? 0;
    const totalVolume = (res?.bars ?? []).reduce((sum, bar) => sum + bar.v, 0);
    const openingPrice = res?.bars?.[0]?.o ?? 0;
    const closingPrice = res?.bars?.[res.bars.length - 1]?.c ?? 0;
    const priceChange = openingPrice ? ((closingPrice - openingPrice) / openingPrice) * 100 : 0;

    return { totalVolume, res, assetPrice, priceChange };
  } catch (error) {
    console.error("Error:", error);
    return { totalVolume: 0, res: {}, assetPrice: 0, priceChange: 0 };
  }
};


export const createAccount = async (name, email, familyName) => {
  const r = await fetch("/api/alpaca/broker/create-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, familyName }),
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json(); 
};

export const fetchAssetDataChart = async (ticket, currentTime, startDate, timeframe, limit) => {
  const formatCurrentTime = currentTime.toISOString().split("T")[0];
  const formatedStartingDate = startDate.toISOString().split("T")[0];

  try {
    const url = `https://data.alpaca.markets/v2/stocks/${ticket}/bars?timeframe=${timeframe}&start=${formatedStartingDate}T00%3A00%3A00Z&end=${formatCurrentTime}T00%3A00%3A00Z&limit=${limit}&adjustment=raw&feed=sip&sort=asc`;

    const res = await alpacaMarketGet(url);

    if (res.bars === null || res.bars.length < 3) {
      currentTime.setDate(currentTime.getDate() - 1);
      return fetchAssetDataChart(ticket, currentTime, startDate, timeframe, limit);
    }

    return res;
  } catch (error) {
    console.error("Error:", error);
    return { bars: [] };
  }
};


export const fetchCurrentPrice = async (ticket) => {
  try {
    const url = `https://data.alpaca.markets/v2/stocks/bars/latest?symbols=${ticket}`;
    const res = await alpacaMarketGet(url);
    return res?.bars?.[ticket]?.c ?? 0;
  } catch (error) {
    console.error("Error:", error);
    return 0;
  }
};

