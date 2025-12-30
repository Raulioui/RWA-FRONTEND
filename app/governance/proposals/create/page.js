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

export default function ProposePage() {

  const assetPool = CONTRACTS.assetPool;
  const governor = CONTRACTS.governor;

  const [name, setName] = useState("");
  const [ticket, setTicket] = useState("");
  const [imageCid, setImageCid] = useState("");
  const [description, setDescription] = useState("");

  const [txHash, setTxHash] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const { writeContractAsync, isPending } = useWriteContract();

  const canSubmit = useMemo(() => {
    return (
      assetPool &&
      governor &&
      assetPool !== "0x0000000000000000000000000000000000000000" &&
      governor !== "0x0000000000000000000000000000000000000000" &&
      name.trim().length > 0 &&
      ticket.trim().length > 0 &&
      description.trim().length > 0
    );
  }, [assetPool, governor, name, ticket, description]);

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
        args: [name.trim(), ticket.trim(), imageCid.trim()],
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

      setName("");
      setTicket("");
      setImageCid("");
      setDescription("");
    } catch (err) {
      const msg =
        (err?.shortMessage || err?.message || "Transaction failed").toString();
      setErrorMsg(msg);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-10 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#CECCF6]">
              New proposal
            </h1>
            <Link className="opacity-80 hover:opacity-100" href="/governance">
              ← Back
            </Link>
          </div>

          {(assetPool === "0x0000000000000000000000000000000000000000" ||
            governor === "0x0000000000000000000000000000000000000000") && (
            <div className="bg-[#1A1B1F] p-4 rounded-lg text-sm mb-6">
              Contract addresses not configured. Edit{" "}
              <code className="opacity-90">app/lib/contracts.js</code> and set:
              <div className="mt-2">
                - <code>CONTRACTS.assetPool</code>
                <br />- <code>CONTRACTS.governor</code>
              </div>
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="bg-[#1A1B1F] rounded-xl p-6 space-y-4"
          >
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
              <div className="text-xs opacity-60 mt-2">
                Use the exact Alpaca symbol your backend supports.
              </div>
            </div>

            <div>
              <label className="text-sm opacity-80">Image CID (optional)</label>
              <input
                className="mt-2 w-full rounded-lg bg-[#0E0B1C] border border-[#2A2B33] px-4 py-3 outline-none"
                value={imageCid}
                onChange={(e) => setImageCid(e.target.value)}
                placeholder="bafy... (IPFS CID)"
              />
            </div>

            <div>
              <label className="text-sm opacity-80">Proposal description</label>
              <textarea
                className="mt-2 w-full rounded-lg bg-[#0E0B1C] border border-[#2A2B33] px-4 py-3 outline-none min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why should this asset be listed? Notes about risks/limits?"
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
              <div className="text-xs opacity-60 mt-2">
                You can now go to the Governance page to see the proposal (after the
                event is indexed).
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-[#1A1B1F] border border-red-500/30 p-4 rounded-lg text-sm mt-6">
              <div className="text-red-300 font-semibold">Error</div>
              <div className="mt-2 opacity-90 break-words">{errorMsg}</div>
            </div>
          )}

          <div className="text-xs opacity-60 mt-4">
            This creates a Governor proposal that calls{" "}
            <code className="opacity-90">AssetPool.createTokenRegistry</code>.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
