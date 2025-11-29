


export const fetchAssetDetails = async (ticket) => {
    const currentTime = new Date();
    const formatCurrentTime = currentTime.toISOString().split('T')[0];
    
    try {
        // Fetch multiple endpoints in parallel for better performance
        const [barsData, snapshotData] = await Promise.all([
            // 1. Hourly bars for 24h
            fetch(`https://data.alpaca.markets/v2/stocks/${ticket}/bars?timeframe=1Hour&start=${formatCurrentTime}T00%3A00%3A00Z&limit=24&adjustment=raw&feed=sip&sort=asc`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_BROKER_KEY,
                    'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_BROKER_SECRET
                }
            }).then(res => res.json()),
            
            // 2. Snapshot (latest trade, quote, daily bars)
            fetch(`https://data.alpaca.markets/v2/stocks/${ticket}/snapshot`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_BROKER_KEY,
                    'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_BROKER_SECRET
                }
            }).then(res => res.json()).catch(() => ({}))
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


// Keep your existing fetchAssetData function for the table component
export const fetchAssetData = async (ticket, currentTime) => {
    const formatCurrentTime = currentTime.toISOString().split('T')[0];
    try {
        const getAssetData = await fetch(`https://data.alpaca.markets/v2/stocks/${ticket}/bars?timeframe=1Hour&start=${formatCurrentTime}T00%3A00%3A00Z&limit=24&adjustment=raw&feed=sip&sort=asc`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_BROKER_KEY,
                'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_BROKER_SECRET
            }
        });

        const res = await getAssetData.json();

        if (res.bars === null || res.bars.length === 1) {
            currentTime.setDate(currentTime.getDate() - 1);
            return fetchAssetData(ticket, currentTime);
        }

        const assetPrice = res?.bars[res?.bars.length - 1].c;
        const totalVolume = res?.bars.reduce((sum, bar) => sum + bar.v, 0);
        const openingPrice = res?.bars[0].o;
        const closingPrice = res?.bars[res?.bars.length - 1].c;
        const priceChange = ((closingPrice - openingPrice) / openingPrice) * 100;

        return { totalVolume, res, assetPrice, priceChange };
    } catch (error) {
        console.error('Error:', error);
        return { totalVolume: 0, res: {}, assetPrice: 0, priceChange: 0 };
    }
};

export const createAccount = async (name, email, familyName) => {
    const timeNow = new Date();
    const formatCurrentTime = timeNow.toISOString().split('T')[0];

    const auth = 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_ALPACA_TRADING_KEY}:${process.env.NEXT_PUBLIC_ALPACA_TRADING_SECRET}`)

    try {
        // Create account
        const getAssetData = await fetch(`https://broker-api.sandbox.alpaca.markets/v1/accounts`, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: auth
            },
            body: JSON.stringify({
                contact: {
                    phone_number: '+15555555555',
                    street_address: ['20 N San Mateo'],
                    city: 'San Mateo',
                    email_address: email,
                    postal_code: '94401',
                    state: 'CA'
                },
                identity: {
                    tax_id_type: 'USA_SSN',
                    date_of_birth: '1990-01-01',
                    country_of_tax_residence: 'USA',
                    funding_source: ['employment_income'],
                    given_name: name,
                    family_name: familyName,
                    tax_id: '643-55-4321'
                },
                disclosures: {
                    is_control_person: true,
                    is_affiliated_exchange_or_finra: true,
                    is_politically_exposed: true,
                    immediate_family_exposed: true
                },
                account_type: 'trading',
                agreements: [
                    { agreement: 'margin_agreement', signed_at: `${formatCurrentTime}T00:00:00Z`, ip_address: '185.54.21.12' },
                    { agreement: 'account_agreement', signed_at: `${formatCurrentTime}T00:00:00Z`, ip_address: '185.54.21.12' },
                    { agreement: 'customer_agreement', signed_at: `${formatCurrentTime}T00:00:00Z`, ip_address: '185.54.21.12' }
                ]
            })
        });

        const res = await getAssetData.json();

        const accountId = res.id;

        if (res.status == 'SUBMITTED') {
            // Get account info 
            const getAccountInfo = await fetch(`https://broker-api.sandbox.alpaca.markets/v1/accounts/${accountId}`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    authorization: auth
                }
            })

            const accountInfo = await getAccountInfo.json();

            // Create ACH relationship
            const createACH = await fetch(`https://broker-api.sandbox.alpaca.markets/v1/accounts/${accountId}/ach_relationships`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: auth
                },
                body: JSON.stringify({
                    bank_account_type: 'CHECKING',
                    account_owner_name: accountInfo.identity.given_name,
                    bank_account_number: accountInfo.account_number,
                    bank_routing_number: '000000000'
                })
            })

            const response = await createACH.json();

            if(response.status == "QUEUED") {
                const fundAccount = await fetch(`https://broker-api.sandbox.alpaca.markets/v1/accounts/${accountId}/transfers`, {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        authorization: auth
                    },
                    body: JSON.stringify({
                        transfer_type: 'ach',
                        direction: 'INCOMING',
                        timing: 'immediate',
                        amount: '10000',
                        relationship_id: response.id
                    })
                })
        
                const fundAccountResponse = await fundAccount.json();

                if(fundAccountResponse.status == "QUEQUED") {
                    throw new Error('Funding account failed');
                } 
            } else {
                throw new Error('ACH relationship creation failed');
            }
        } else {
            throw new Error('Account creation failed');
        }

        return accountId;
    } catch (error) {
        console.error('Error:', error);
        return error;
    }
}

export const fetchAssetDataChart = async (ticket, currentTime, startDate, timeframe, limit) => {
    const formatCurrentTime = currentTime.toISOString().split('T')[0];
    const formatedStartingDate = startDate.toISOString().split('T')[0];

    try {
        const getAssetData = await fetch(`https://data.alpaca.markets/v2/stocks/${ticket}/bars?timeframe=${timeframe}&start=${formatedStartingDate}T00%3A00%3A00Z&end=${formatCurrentTime}T00%3A00%3A00Z&limit=${limit}&adjustment=raw&feed=sip&sort=asc`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_BROKER_KEY,
                'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_BROKER_SECRET
            }
        });

        const res = await getAssetData.json();

        if (res.bars === null || res.bars.length < 3) {
            currentTime.setDate(currentTime.getDate() - 1);
            return fetchAssetData(ticket, currentTime); // Llamada recursiva para retroceder un día
        }

        return res
    } catch (error) {
        console.error('Error:', error);
    }
}

export const fetchCurrentPrice = async (ticket) => {
    try {
        const getAssetData = await fetch(`https://data.alpaca.markets/v2/stocks/bars/latest?symbols=${ticket}`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_BROKER_KEY,
                'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_BROKER_SECRET
            }
        });

        const res = await getAssetData.json();
        const price = res?.bars[ticket].c
        return price
    } catch (error) {
        console.error('Error:', error);
    }
}


export const fetchAccountOrders = async () => {
    const auth = 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_ALPACA_BROKER_KEY}:${process.env.NEXT_PUBLIC_ALPACA_BROKER_SECRET}`)

    try {
        const getAssetData = await fetch(`https://broker-api.sandbox.alpaca.markets/v1/accounts/activities/FILL?account_id=794a4d52-3746-4e99-ae86-038ead252047&page_size=100`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: auth
            }
        });

        const res = await getAssetData.json();
        return res
    } catch (error) {
        console.error('Error:', error);
    }
}