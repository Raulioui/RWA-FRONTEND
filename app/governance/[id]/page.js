"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { CONTRACTS } from "../../../lib/contracts";
import governorAbi from "../../../abi/governor.json";
import {
    parseAbiItem,
    keccak256,
    toBytes,
    isAddress,
} from "viem";

const votesTokenAbi = [
    {
        type: "function",
        name: "delegate",
        stateMutability: "nonpayable",
        inputs: [{ name: "delegatee", type: "address" }],
        outputs: [],
    },
];

const proposalCreatedEvent = parseAbiItem(
    "event ProposalCreated(uint256 proposalId,address proposer,address[] targets,uint256[] values,string[] signatures,bytes[] calldatas,uint256 startBlock,uint256 endBlock,string description)"
);

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

export default function ProposalDetailPage({ params }) {
    const publicClient = usePublicClient();
    const { address: user } = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();

    const governor = CONTRACTS.governor;
    const fromBlock = CONTRACTS.governorDeployBlock ?? 0n;

    const proposalId = useMemo(() => {
        try {
            return BigInt(params.id);
        } catch {
            return null;
        }
    }, [params.id]);

    const [loading, setLoading] = useState(true);
    const [proposal, setProposal] = useState(null);
    const [stateNum, setStateNum] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [deadline, setDeadline] = useState(null);
    const [votes, setVotes] = useState(null);

    const [tokenAddr, setTokenAddr] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [errMsg, setErrMsg] = useState(null);

    const canLoad = useMemo(() => {
        return !!publicClient && isAddress(governor) && proposalId !== null;
    }, [publicClient, governor, proposalId]);

    async function refresh() {
        if (!canLoad) return;

        setErrMsg(null);
        setLoading(true);

        try {
            // 1) Fetch ProposalCreated log for this proposalId
            const logs = await publicClient.getLogs({
                address: governor,
                event: proposalCreatedEvent,
                fromBlock,
                toBlock: "latest",
            });

            const found = logs.find((l) => l.args?.proposalId === proposalId);
            if (!found) {
                setProposal(null);
                setStateNum(null);
                setSnapshot(null);
                setDeadline(null);
                setVotes(null);
                return;
            }

            const p = {
                id: found.args.proposalId,
                proposer: found.args.proposer,
                targets: found.args.targets,
                values: found.args.values,
                calldatas: found.args.calldatas,
                description: found.args.description,
                startBlock: found.args.startBlock,
                endBlock: found.args.endBlock,
            };
            setProposal(p);

            // 2) Read state/snapshot/deadline/votes
            const [st, snap, dead] = await Promise.all([
                publicClient.readContract({
                    address: governor,
                    abi: governorAbi,
                    functionName: "state",
                    args: [proposalId],
                }),
                publicClient.readContract({
                    address: governor,
                    abi: governorAbi,
                    functionName: "proposalSnapshot",
                    args: [proposalId],
                }),
                publicClient.readContract({
                    address: governor,
                    abi: governorAbi,
                    functionName: "proposalDeadline",
                    args: [proposalId],
                }),
            ]);

            setStateNum(Number(st));
            setSnapshot(snap);
            setDeadline(dead);

            try {
                const v = await publicClient.readContract({
                    address: governor,
                    abi: governorAbi,
                    functionName: "proposalVotes",
                    args: [proposalId],
                });
                setVotes({
                    against: v[0],
                    for: v[1],
                    abstain: v[2],
                });
            } catch {
                setVotes(null);
            }

            // 3) Get voting token address (GovernorVotes extension)
            try {
                const t = await publicClient.readContract({
                    address: governor,
                    abi: governorAbi,
                    functionName: "token",
                    args: [],
                });
                setTokenAddr(t);
            } catch {
                setTokenAddr(null);
            }
        } catch (e) {
            setErrMsg((e?.shortMessage || e?.message || "Failed to load").toString());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, [canLoad]);

    const descriptionHash = useMemo(() => {
        if (!proposal?.description) return null;
        return keccak256(toBytes(proposal.description));
    }, [proposal?.description]);

    async function delegateToSelf() {
        setErrMsg(null);
        setTxHash(null);
        if (!user) return setErrMsg("Connect wallet first.");
        if (!tokenAddr || !isAddress(tokenAddr)) return setErrMsg("Voting token not found on Governor.");

        try {
            const hash = await writeContractAsync({
                address: tokenAddr,
                abi: votesTokenAbi,
                functionName: "delegate",
                args: [user],
            });
            setTxHash(hash);
        } catch (e) {
            setErrMsg((e?.shortMessage || e?.message || "Delegate failed").toString());
        }
    }

    async function castVote(support) {
        setErrMsg(null);
        setTxHash(null);
        if (!proposalId) return;
        if (!user) return setErrMsg("Connect wallet first.");

        try {
            const hash = await writeContractAsync({
                address: governor,
                abi: governorAbi,
                functionName: "castVote",
                args: [proposalId, support],
            });
            setTxHash(hash);
        } catch (e) {
            setErrMsg((e?.shortMessage || e?.message || "Vote failed").toString());
        }
    }

    async function queueProposal() {
        setErrMsg(null);
        setTxHash(null);

        if (!proposal || !descriptionHash) return setErrMsg("Proposal data not loaded.");
        if (!user) return setErrMsg("Connect wallet first.");

        try {
            const hash = await writeContractAsync({
                address: governor,
                abi: governorAbi,
                functionName: "queue",
                args: [proposal.targets, proposal.values, proposal.calldatas, descriptionHash],
            });
            setTxHash(hash);
        } catch (e) {
            setErrMsg((e?.shortMessage || e?.message || "Queue failed").toString());
        }
    }

    async function executeProposal() {
        setErrMsg(null);
        setTxHash(null);

        if (!proposal || !descriptionHash) return setErrMsg("Proposal data not loaded.");
        if (!user) return setErrMsg("Connect wallet first.");

        try {
            const hash = await writeContractAsync({
                address: governor,
                abi: governorAbi,
                functionName: "execute",
                args: [proposal.targets, proposal.values, proposal.calldatas, descriptionHash],
                value: 0n,
            });
            setTxHash(hash);
        } catch (e) {
            setErrMsg((e?.shortMessage || e?.message || "Execute failed").toString());
        }
    }

    const stateLabel = stateNum === null ? "Unknown" : STATE_LABEL[stateNum] ?? `State ${stateNum}`;
    const isActive = stateNum === 1;
    const isSucceeded = stateNum === 4;
    const isQueued = stateNum === 5;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 px-10 pb-16">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <Link className="opacity-80 hover:opacity-100" href="/governance">
                            ← Back
                        </Link>
                    </div>

                    {!canLoad && (
                        <div className="bg-[#1A1B1F] p-5 rounded-xl">
                            <div className="text-sm opacity-80">
                                Missing config or invalid proposal id. Check:
                                <ul className="list-disc ml-6 mt-2">
                                    <li><code>CONTRACTS.governor</code> in <code>app/lib/contracts.js</code></li>
                                    <li>URL param must be a number (e.g. /governance/123)</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-[#1A1B1F] p-6 rounded-xl">Loading proposal…</div>
                    ) : !proposal ? (
                        <div className="bg-[#1A1B1F] p-6 rounded-xl">
                            Proposal not found (no ProposalCreated event found for this id).
                        </div>
                    ) : (
                        <>
                            <div className="bg-[#1A1B1F] rounded-xl p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="text-xs opacity-70">Proposer</div>
                                        <div className="text-sm font-semibold text-[#CECCF6]">
                                            {proposal.proposer}
                                        </div>

                                        <div className="mt-5 text-xs opacity-70">Description</div>
                                        <div className="mt-2 text-sm opacity-90 whitespace-pre-wrap">
                                            {proposal.description}
                                        </div>
                                    </div>

                                    <div className="min-w-[240px] bg-[#0E0B1C] border border-[#2A2B33] rounded-xl p-4">
                                        <div className="text-xs opacity-70">State</div>
                                        <div className="text-lg font-bold text-[#CECCF6]">{stateLabel}</div>

                                        <div className="mt-4 text-xs opacity-70">Blocks</div>
                                        <div className="text-sm">
                                            {snapshot ? snapshot.toString() : "-"} → {deadline ? deadline.toString() : "-"}
                                        </div>

                                        {votes && (
                                            <>
                                                <div className="mt-4 text-xs opacity-70">Votes</div>
                                                <div className="text-sm">
                                                    For: <span className="font-mono">{votes.for.toString()}</span>
                                                </div>
                                                <div className="text-sm">
                                                    Against: <span className="font-mono">{votes.against.toString()}</span>
                                                </div>
                                                <div className="text-sm">
                                                    Abstain: <span className="font-mono">{votes.abstain.toString()}</span>
                                                </div>
                                            </>
                                        )}

                                        <div className="mt-4 text-xs opacity-70">Description hash</div>
                                        <div className="text-xs font-mono break-all opacity-80">
                                            {descriptionHash}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-[#1A1B1F] rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-[#CECCF6] font-semibold">Actions</div>
                                    <button
                                        onClick={refresh}
                                        className="text-sm bg-[#23242A] hover:bg-[#2A2B33] px-3 py-2 rounded-lg duration-100"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={delegateToSelf}
                                        disabled={!user || !tokenAddr || isPending}
                                        className="bg-[#23242A] hover:bg-[#2A2B33] disabled:opacity-50 text-[#CECCF6] px-4 py-3 rounded-lg duration-100"
                                    >
                                        {tokenAddr ? `Delegate to self (${shortAddr(tokenAddr)})` : "Delegate (token not found)"}
                                    </button>

                                    <button
                                        onClick={() => castVote(1)}
                                        disabled={!isActive || !user || isPending}
                                        className="bg-[#23242A] hover:bg-[#2A2B33] disabled:opacity-50 text-[#CECCF6] px-4 py-3 rounded-lg duration-100"
                                    >
                                        Vote FOR
                                    </button>

                                    <button
                                        onClick={() => castVote(0)}
                                        disabled={!isActive || !user || isPending}
                                        className="bg-[#23242A] hover:bg-[#2A2B33] disabled:opacity-50 text-[#CECCF6] px-4 py-3 rounded-lg duration-100"
                                    >
                                        Vote AGAINST
                                    </button>

                                    <button
                                        onClick={() => castVote(2)}
                                        disabled={!isActive || !user || isPending}
                                        className="bg-[#23242A] hover:bg-[#2A2B33] disabled:opacity-50 text-[#CECCF6] px-4 py-3 rounded-lg duration-100"
                                    >
                                        Vote ABSTAIN
                                    </button>

                                    <button
                                        onClick={queueProposal}
                                        disabled={!isSucceeded || !user || isPending}
                                        className="bg-[#23242A] hover:bg-[#2A2B33] disabled:opacity-50 text-[#CECCF6] px-4 py-3 rounded-lg duration-100"
                                    >
                                        Queue (when Succeeded)
                                    </button>

                                    <button
                                        onClick={executeProposal}
                                        disabled={!isQueued || !user || isPending}
                                        className="bg-[#23242A] hover:bg-[#2A2B33] disabled:opacity-50 text-[#CECCF6] px-4 py-3 rounded-lg duration-100"
                                    >
                                        Execute (when Queued)
                                    </button>
                                </div>

                                <div className="text-xs opacity-60 mt-4">
                                    Notes:
                                    <ul className="list-disc ml-5 mt-2 space-y-1">
                                        <li>Voting only works when the proposal is <b>Active</b>.</li>
                                        <li>Queue only works when the proposal is <b>Succeeded</b>.</li>
                                        <li>Execute only works when the proposal is <b>Queued</b> (and timelock delay passed; in your demo it’s likely 0).</li>
                                        <li>If your vote has no weight, you probably need to <b>delegate</b> first.</li>
                                    </ul>
                                </div>
                            </div>

                            {txHash && (
                                <div className="mt-6 bg-[#1A1B1F] p-4 rounded-xl text-sm">
                                    Submitted tx hash:
                                    <div className="mt-2 break-all font-mono opacity-90">{txHash}</div>
                                </div>
                            )}

                            {errMsg && (
                                <div className="mt-6 bg-[#1A1B1F] border border-red-500/30 p-4 rounded-xl text-sm">
                                    <div className="text-red-300 font-semibold">Error</div>
                                    <div className="mt-2 opacity-90 break-words">{errMsg}</div>
                                </div>
                            )}

                            <div className="mt-6 bg-[#1A1B1F] rounded-xl p-6">
                                <div className="text-[#CECCF6] font-semibold mb-3">Call data</div>

                                <div className="text-xs opacity-70">Targets</div>
                                <pre className="mt-2 text-xs font-mono bg-[#0E0B1C] border border-[#2A2B33] rounded-lg p-4 overflow-x-auto">
                                    {JSON.stringify(proposal.targets, null, 2)}
                                </pre>

                                <div className="text-xs opacity-70 mt-4">Values</div>
                                <pre className="mt-2 text-xs font-mono bg-[#0E0B1C] border border-[#2A2B33] rounded-lg p-4 overflow-x-auto">
                                    {JSON.stringify(proposal.values?.map((v) => v.toString()), null, 2)}
                                </pre>

                                <div className="text-xs opacity-70 mt-4">Calldatas</div>
                                <pre className="mt-2 text-xs font-mono bg-[#0E0B1C] border border-[#2A2B33] rounded-lg p-4 overflow-x-auto">
                                    {JSON.stringify(proposal.calldatas, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
