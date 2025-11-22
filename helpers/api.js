


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
            return fetchAssetData(ticket, currentTime); // Llamada recursiva para retroceder un día
        }

        const assetPrice = res?.bars[res?.bars.length - 1].c

        const totalVolume = res?.bars.reduce((sum, bar) => sum + bar.v, 0);

        // Price Change Percentage Calculation
        const openingPrice = res?.bars[0].o;  // First bar's opening price
        const closingPrice = res?.bars[res?.bars.length - 1].c  // Last bar's closing price
        const priceChange = ((closingPrice - openingPrice) / openingPrice) * 100

        return { totalVolume, res, assetPrice, priceChange }
    } catch (error) {
        console.error('Error:', error);
    }
}

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

export const fetchAssetDetails = async (ticket) => {
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
        const hightPrice = res?.bars[ticket].h
        const lowPrice = res?.bars[ticket].l

        const openingPrice = res?.bars[ticket].o;  // First bar's opening price
        const closingPrice = res?.bars[ticket].c  // Last bar's closing price
        const priceChange = ((closingPrice - openingPrice) / openingPrice) * 100

        return {hightPrice, lowPrice, priceChange}
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