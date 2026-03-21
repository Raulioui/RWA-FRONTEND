import "server-only";

const BASE_URL = "https://broker-api.sandbox.alpaca.markets";

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  try {
    const key = process.env.ALPACA_TRADING_KEY;
    const secret = process.env.ALPACA_TRADING_SECRET;

    if (!key || !secret) {
      return json(500, { error: "Missing ALPACA_KEY_ID / ALPACA_SECRET_KEY" });
    }

    const { name, email, familyName } = await req.json();

    if (!name || !email || !familyName) {
      return json(400, { error: "Missing name/email/familyName" });
    }

    const now = new Date().toISOString().slice(0, 10); 

    // 1) Create account
    const createRes = await fetch(`${BASE_URL}/v1/accounts`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "APCA-API-KEY-ID": key,
        "APCA-API-SECRET-KEY": secret,
      },
      body: JSON.stringify({
        contact: {
          phone_number: "+15555555555",
          street_address: ["20 N San Mateo"],
          city: "San Mateo",
          email_address: email,
          postal_code: "94401",
          state: "CA",
        },
        identity: {
          tax_id_type: "USA_SSN",
          date_of_birth: "1990-01-01",
          country_of_tax_residence: "USA",
          funding_source: ["employment_income"],
          given_name: name,
          family_name: familyName,
          tax_id: "643-55-4321",
        },
        disclosures: {
          is_control_person: true,
          is_affiliated_exchange_or_finra: true,
          is_politically_exposed: true,
          immediate_family_exposed: true,
        },
        account_type: "trading",
        agreements: [
          { agreement: "margin_agreement", signed_at: `${now}T00:00:00Z`, ip_address: "185.54.21.12" },
          { agreement: "account_agreement", signed_at: `${now}T00:00:00Z`, ip_address: "185.54.21.12" },
          { agreement: "customer_agreement", signed_at: `${now}T00:00:00Z`, ip_address: "185.54.21.12" },
        ],
      }),
      cache: "no-store",
    });

    const createText = await createRes.text();
    let createJson;
    try {
      createJson = JSON.parse(createText);
    } catch {
      createJson = { raw: createText };
    }

    if (!createRes.ok) {
      return json(createRes.status, {
        error: "Alpaca create account failed",
        details: createJson,
      });
    }

    console.log("Alpaca create account response:", createJson);

    const accountId = createJson?.id;
    if (!accountId) {
      return json(500, { error: "Alpaca response missing account id", details: createJson });
    }

    if (createJson?.status !== "SUBMITTED") {
      return json(200, { accountId, status: createJson?.status });
    }

    const infoRes = await fetch(`${BASE_URL}/v1/accounts/${accountId}`, {
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": key,
        "APCA-API-SECRET-KEY": secret,
      },
      cache: "no-store",
    });

    const info = infoRes.ok ? await infoRes.json() : null;

    let ach = null;

    if (info?.identity?.given_name && info?.account_number) {
      const achRes = await fetch(`${BASE_URL}/v1/accounts/${accountId}/ach_relationships`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "APCA-API-KEY-ID": key,
          "APCA-API-SECRET-KEY": secret,
        },
        body: JSON.stringify({
          bank_account_type: "CHECKING",
          account_owner_name: info.identity.given_name,
          bank_account_number: info.account_number, 
          bank_routing_number: "000000000",
        }),
        cache: "no-store",
      });

      ach = achRes.ok ? await achRes.json() : null;
    }

    let transfer = null;

    if (ach?.id && ach?.status === "QUEUED") {
      const trRes = await fetch(`${BASE_URL}/v1/accounts/${accountId}/transfers`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "APCA-API-KEY-ID": key,
          "APCA-API-SECRET-KEY": secret,
        },
        body: JSON.stringify({
          transfer_type: "ach",
          direction: "INCOMING",
          timing: "immediate",
          amount: "10000",
          relationship_id: ach.id,
        }),
        cache: "no-store",
      });

      transfer = trRes.ok ? await trRes.json() : null;
    }

    return json(200, {
      accountId,
      status: createJson?.status,
      achStatus: ach?.status ?? null,
      transferStatus: transfer?.status ?? null,
    });
  } catch (e) {
    return json(500, { error: e?.message || "Server error" });
  }
}
