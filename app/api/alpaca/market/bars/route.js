import "server-only";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url"); // full alpaca URL encoded

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url param" }), { status: 400 });
  }

  const key = process.env.ALPACA_KEY_ID;
  const secret = process.env.ALPACA_SECRET_KEY;

  if (!key || !secret) {
    return new Response(JSON.stringify({ error: "Missing Alpaca env vars" }), { status: 500 });
  }

  const r = await fetch(url, {
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": key,
      "APCA-API-SECRET-KEY": secret,
    },
    cache: "no-store",
  });

  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
