// app/api/ipfs/upload/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // importante para FormData + buffers en algunas setups

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Missing file. Send as multipart/form-data with field name 'file'." },
        { status: 400 }
      );
    }

    // (Opcional) valida tipo
    const allowed = [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (file.type && !allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "Missing PINATA_JWT env var on server." },
        { status: 500 }
      );
    }

    // FormData nuevo para Pinata
    const pinataForm = new FormData();
    pinataForm.append("file", file, file.name);

    // metadata opcional
    pinataForm.append(
      "pinataMetadata",
      JSON.stringify({ name: file.name })
    );

    // options opcional
    pinataForm.append(
      "pinataOptions",
      JSON.stringify({ cidVersion: 1 })
    );

    const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        // NO pongas Content-Type aquí, fetch lo pone con boundary automáticamente
      },
      body: pinataForm,
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return NextResponse.json(
        { error: "Pinata upload failed", details: data },
        { status: r.status }
      );
    }

    // Pinata devuelve IpfsHash
    const cid = data?.IpfsHash;

    if (!cid) {
      return NextResponse.json(
        { error: "Pinata response missing IpfsHash", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ cid });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
