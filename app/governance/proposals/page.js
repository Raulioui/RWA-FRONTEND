"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { useRouter } from "next/navigation";
import { CONTRACTS } from "../../../lib/contracts";
import Link from "next/link";

const proposalCreatedEvent = parseAbiItem(
    "event ProposalCreated(uint256 proposalId,address proposer,address[] targets,uint256[] values,string[] signatures,bytes[] calldatas,uint256 startBlock,uint256 endBlock,string description)"
);

const governorAbi = [
    {
        type: "function",
        name: "state",
        stateMutability: "view",
        inputs: [{ name: "proposalId", type: "uint256" }],
        outputs: [{ name: "", type: "uint8" }],
    },
];

const STATE_LABEL = {
    0: "Pending",
    1: "Active",
    2: "Canceled",
    3: "Defeated",
    4: "Succeeded",
    5: "Queued",
    6: "Expired",
    7: "Executed",
};

function shortAddr(a) {
    if (!a || a.length < 10) return a;
    return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function trimDesc(s, n = 160) {
    if (!s) return "";
    return s.length > n ? `${s.slice(0, n)}…` : s;
}

export default function GovernorListPage() {
    const router = useRouter();
    const publicClient = usePublicClient();

    const governor = CONTRACTS.governor;
    const fromBlock = CONTRACTS.governorDeployBlock ?? 0n;

    const [loading, setLoading] = useState(true);
    const [proposals, setProposals] = useState([]);
    const [errMsg, setErrMsg] = useState(null);

    const canLoad = useMemo(
        () => !!publicClient && !!governor && governor !== "0x0000000000000000000000000000000000000000",
        [publicClient, governor]
    );

    useEffect(() => {
        if (!canLoad) return;

        (async () => {
            setLoading(true);
            setErrMsg(null);

            try {
                const logs = await publicClient.getLogs({
                    address: governor,
                    event: proposalCreatedEvent,
                    fromBlock,
                    toBlock: "latest",
                });

                const base = logs
                    .map((l) => ({
                        id: l.args.proposalId,
                        proposer: l.args.proposer,
                        description: l.args.description,
                        startBlock: l.args.startBlock,
                        endBlock: l.args.endBlock,
                    }))
                    .reverse();
                    
                const withState = await Promise.all(
                    base.map(async (p) => {
                        try {
                            const state = await publicClient.readContract({
                                address: governor,
                                abi: governorAbi,
                                functionName: "state",
                                args: [p.id],
                            });
                            return { ...p, state: Number(state) };
                        } catch {
                            return { ...p, state: null };
                        }
                    })
                );

                setProposals(withState);
            } catch (e) {
                setErrMsg((e?.shortMessage || e?.message || "Failed to load proposals").toString());
            } finally {
                setLoading(false);
            }
        })();
    }, [canLoad, publicClient, governor, fromBlock]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 mt-24 px-10 pb-16">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#CECCF6]">
                            Proposals
                        </h1>

                        <Link
                            href="/governance/proposals/create"
                            className="w-[200px] py-3 border border-purple-500/60 text-purple-300 hover:bg-purple-500/10 font-semibold rounded-lg transition text-center"
                        >
                            Create proposal
                        </Link>
                    </div>

                    {!canLoad && (
                        <div className="bg-[#1A1B1F] p-5 rounded-xl text-sm">
                            Configure <code>CONTRACTS.governor</code> in{" "}
                            <code>app/lib/contracts.js</code>.
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-[#1A1B1F] p-6 rounded-xl">Loading proposals…</div>
                    ) : errMsg ? (
                        <div className="bg-[#1A1B1F] border border-red-500/30 p-6 rounded-xl">
                            <div className="text-red-300 font-semibold">Error</div>
                            <div className="mt-2 text-sm opacity-90 break-words">{errMsg}</div>
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="bg-[#1A1B1F] p-6 rounded-xl">
                            No proposals found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {proposals.map((p) => {
                                const label = p.state === null ? "Unknown" : (STATE_LABEL[p.state] ?? `State ${p.state}`);

                                return (
                                    <button
                                        key={p.id.toString()}
                                        onClick={() => router.push(`/governance/proposals/${p.id.toString()}`)}
                                        className="w-full text-left bg-[#1A1B1F] hover:bg-[#23242A] rounded-xl p-5 duration-100"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-[#CECCF6] font-semibold">
                                                    Proposal #{p.id.toString()}
                                                </div>
                                                <div className="text-xs opacity-75 mt-1">
                                                    Proposer: {shortAddr(p.proposer)}
                                                </div>
                                                <div className="text-sm mt-3 opacity-90 whitespace-pre-wrap">
                                                    {trimDesc(p.description)}
                                                </div>
                                            </div>

                                            <div className="text-right min-w-[120px]">
                                                <div className="text-xs opacity-70">State</div>
                                                <div className="text-sm font-semibold text-[#CECCF6]">
                                                    {label}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs opacity-60 mt-4">
                                            Blocks: {p.startBlock?.toString()} → {p.endBlock?.toString()}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
