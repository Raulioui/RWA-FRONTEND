"use client";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { useMemo, useState } from "react";
import { encodeFunctionData } from "viem";
import { useWriteContract } from "wagmi";
import { CONTRACTS } from "../../../../lib/contracts";
import assetPoolAbi from "../../../../abi/assetPool.json";
import governorAbi from "../../../../abi/governor.json";

async function uploadImageToIpfs(file) {
  const fd = new FormData();
  fd.append("file", file);

  const r = await fetch("/api/ipfs/upload", {
    method: "POST",
    body: fd,
  });

  if (!r.ok) throw new Error(await r.text());
  const { cid } = await r.json();
  return cid;
}

export default function ProposePage() {
  const assetPool = CONTRACTS.assetPool;
  const governor = CONTRACTS.governor;

  const [name, setName] = useState("");
  const [ticket, setTicket] = useState("");
  const [imageCid, setImageCid] = useState("");
  const [description, setDescription] = useState("");

  const [txHash, setTxHash] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // upload UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOk, setUploadOk] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);

  const { writeContractAsync, isPending } = useWriteContract();

  const canSubmit = useMemo(() => {
    return (
      assetPool &&
      governor &&
      assetPool !== "0x0000000000000000000000000000000000000000" &&
      governor !== "0x0000000000000000000000000000000000000000" &&
      name.trim().length > 0 &&
      ticket.trim().length > 0 &&
      description.trim().length > 0 &&
      !isUploading // evita submit mientras sube imagen
    );
  }, [assetPool, governor, name, ticket, description, isUploading]);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadErr(null);
    setUploadOk(false);
    setIsUploading(true);

    try {
      const cid = await uploadImageToIpfs(file);
      console.log(cid)
      setImageCid(cid);
      setUploadOk(true);
    } catch (err) {
      setUploadErr((err?.message || "Upload failed").toString());
      setImageCid("");
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);
    setTxHash(null);

    if (!canSubmit) {
      setErrorMsg("Missing fields or contract addresses not configured.");
      return;
    }

    try {
      const calldata = encodeFunctionData({
        abi: assetPoolAbi,
        functionName: "createTokenRegistry",
        args: [name.trim(), ticket.trim(), imageCid.trim()], // imageCid puede ser "" si es opcional
      });

      const targets = [assetPool];
      const values = [0n];
      const calldatas = [calldata];

      const fullDescription =
        description.trim() +
        `\n\nToken:\n- name: ${name.trim()}\n- ticket: ${ticket.trim()}\n- imageCid: ${imageCid.trim() || "(none)"}`;

      const hash = await writeContractAsync({
        address: governor,
        abi: governorAbi,
        functionName: "propose",
        args: [targets, values, calldatas, fullDescription],
      });

      setTxHash(hash);

      // reset
      setName("");
      setTicket("");
      setImageCid("");
      setDescription("");
      setUploadOk(false);
      setUploadErr(null);
    } catch (err) {
      const msg = (err?.shortMessage || err?.message || "Transaction failed").toString();
      setErrorMsg(msg);
    }
  }

  const previewUrl = imageCid ? `https://ipfs.io/ipfs/${imageCid}` : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-10 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#CECCF6]">New proposal</h1>
            <Link className="opacity-80 hover:opacity-100" href="/governance">
              ← Back
            </Link>
          </div>

          <form onSubmit={onSubmit} className="bg-[#1A1B1F] rounded-xl p-6 space-y-4">
            <div>
              <label className="text-sm opacity-80">Asset name</label>
              <input
                className="mt-2 w-full rounded-lg bg-[#0E0B1C] border border-[#2A2B33] px-4 py-3 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tesla Stock Token"
              />
            </div>

            <div>
              <label className="text-sm opacity-80">Ticket / Symbol</label>
              <input
                className="mt-2 w-full rounded-lg bg-[#0E0B1C] border border-[#2A2B33] px-4 py-3 outline-none"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                placeholder="TSLA"
              />
            </div>

            {/* Upload image */}
            <div>
              <label className="text-sm opacity-80">Project image (optional)</label>

              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="block w-full text-sm"
                />

                {isUploading && (
                  <span className="text-xs opacity-70">Uploading…</span>
                )}

                {uploadOk && !isUploading && (
                  <span className="text-xs text-green-300">Uploaded ✓</span>
                )}
              </div>

              {uploadErr && (
                <div className="mt-2 text-xs text-red-300 break-words">
                  Upload error: {uploadErr}
                </div>
              )}

              {/* CID + preview */}
              <div className="mt-3">
                <label className="text-xs opacity-70">Image CID</label>
                <input
                  className="mt-2 w-full rounded-lg bg-[#0E0B1C] border border-[#2A2B33] px-4 py-3 outline-none font-mono text-xs"
                  value={imageCid}
                  onChange={(e) => setImageCid(e.target.value)}
                  placeholder="bafy... (CID)"
                />
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs opacity-80 underline mt-2 inline-block"
                  >
                    Preview on IPFS gateway
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm opacity-80">Proposal description</label>
              <textarea
                className="mt-2 w-full rounded-lg bg-[#0E0B1C] border border-[#2A2B33] px-4 py-3 outline-none min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why should this asset be listed?"
              />
            </div>

            <button
              disabled={!canSubmit || isPending}
              className="w-full bg-[#23242A] hover:bg-[#2A2B33] disabled:opacity-50 text-[#CECCF6] px-4 py-3 rounded-lg duration-100"
            >
              {isPending ? "Submitting proposal..." : "Submit proposal"}
            </button>
          </form>

          {txHash && (
            <div className="bg-[#1A1B1F] p-4 rounded-lg text-sm mt-6">
              Submitted! Tx hash:
              <div className="mt-2 break-all font-mono opacity-90">{txHash}</div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-[#1A1B1F] border border-red-500/30 p-4 rounded-lg text-sm mt-6">
              <div className="text-red-300 font-semibold">Error</div>
              <div className="mt-2 opacity-90 break-words">{errorMsg}</div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
