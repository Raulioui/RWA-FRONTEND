"use client"
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import assetPool from "../../../abi/assetPool.json";
import { arbitrumSepolia } from 'wagmi/chains';
import { parseUnits, formatUnits } from "viem";
import usdtAbi from "../../../abi/usdtAbi.json";
import assetAbi from "../../../abi/assetAbi.json";

const ASSET_POOL_ADDRESS = "0x549746c116153aFA22c4A1927E9DD4Cb30A26797";
const USDT_ADDRESS = "0x80Efc4Bcb5797a952943512b10c1595aCdE821cC";

export default function AssetExchange({ ticket, price, token, loading, assetDetails }) {
    const [usdQty, setUsdQty] = useState(0);
    const [assetQty, setAssetQty] = useState(1);
    const [mintMode, setMintMode] = useState(true);
    const [sellMode, setSellMode] = useState(false);

    const account = useAccount();
    
    // Separate hooks for approval and trading
    const { 
        data: approvalHash, 
        writeContractAsync: approveContract, 
        isPending: isApprovePending,
        isError: isApproveError,
        error: approveError 
    } = useWriteContract();
    
    const { 
        data: tradeHash, 
        writeContractAsync: tradeContract, 
        isPending: isTradePending,
        isError: isTradeError,
        error: tradeError 
    } = useWriteContract();
    
    const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = 
        useWaitForTransactionReceipt({ hash: approvalHash });
    
    const { isLoading: isTradeConfirming, isSuccess: isTradeSuccess } = 
        useWaitForTransactionReceipt({ hash: tradeHash });

    // Hook para obtener accountId
    const { data: accountId } = useReadContract({
        chainId: arbitrumSepolia.id,
        address: ASSET_POOL_ADDRESS,
        functionName: 'userToAccountId',
        abi: assetPool,
        args: [account?.address],
    });

    // Hook para obtener allowance de USDT
    const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
        address: USDT_ADDRESS,
        abi: usdtAbi,
        functionName: 'allowance',
        args: [account?.address, ASSET_POOL_ADDRESS],
        chainId: arbitrumSepolia.id,
        query: {
            enabled: !!account?.address
        }
    });

    // Hook para obtener allowance de Asset
    const { data: assetAllowance, refetch: refetchAssetAllowance } = useReadContract({
        address: token?.assetAddress,
        abi: assetAbi,
        functionName: 'allowance',
        args: [account?.address, ASSET_POOL_ADDRESS],
        chainId: arbitrumSepolia.id,
        query: {
            enabled: !!account?.address && !!token?.assetAddress
        }
    });

    console.log(token)

    // Hook para obtener balance de asset
    const { data: assetBalanceRaw, refetch: refetchAssetBalance } = useReadContract({
        address: token?.assetAddress,
        abi: assetAbi,
        functionName: "balanceOf",
        args: [account?.address],
        chainId: arbitrumSepolia.id,
        query: {
            enabled: !!account?.address && !!token?.assetAddress
        }
    });

    // Hook para obtener balance de USDT
    const { data: usdtBalanceRaw, refetch: refetchUsdtBalance } = useReadContract({
        address: USDT_ADDRESS,
        abi: usdtAbi,
        functionName: "balanceOf",
        args: [account?.address],
        chainId: arbitrumSepolia.id,
        query: {
            enabled: !!account?.address
        }
    });

    // Formatear balances
    const assetBalance = assetBalanceRaw ? formatUnits(assetBalanceRaw, 18) : "0";
    const usdtBalance = usdtBalanceRaw ? formatUnits(usdtBalanceRaw, 6) : "0";

    // Memoize approval check functions
    const needsUsdtApproval = useMemo(() => {
        if (!usdtAllowance || !usdQty || usdQty <= 0) return true;
        try {
            const requiredAmount = parseUnits(usdQty.toString(), 6);
            return BigInt(usdtAllowance) < BigInt(requiredAmount);
        } catch {
            return true;
        }
    }, [usdtAllowance, usdQty]);

    const needsAssetApproval = useMemo(() => {
        if (!assetAllowance || !assetQty || assetQty <= 0) return true;
        try {
            const requiredAmount = parseUnits(assetQty.toString(), 18);
            return BigInt(assetAllowance) < BigInt(requiredAmount);
        } catch {
            return true;
        }
    }, [assetAllowance, assetQty]);

    // Determine which approval is needed based on mode
    const needsApproval = mintMode ? needsUsdtApproval : needsAssetApproval;

    // Auto-refetch allowances after approval success
    useEffect(() => {
        if (isApprovalSuccess) {
            const refetchAllowances = async () => {
                await Promise.all([
                    refetchUsdtAllowance(),
                    refetchAssetAllowance()
                ]);
            };
            refetchAllowances();
        }
    }, [isApprovalSuccess, refetchUsdtAllowance, refetchAssetAllowance]);

    // Refetch balances after trade success
    useEffect(() => {
        if (isTradeSuccess) {
            const refetchBalances = async () => {
                await Promise.all([
                    refetchUsdtBalance(),
                    refetchAssetBalance()
                ]);
            };
            refetchBalances();
        }
    }, [isTradeSuccess, refetchUsdtBalance, refetchAssetBalance]);

    const handleApprove = useCallback(async () => {
        if (!token?.assetAddress) {
            console.error("Token address not available");
            return;
        }

        try {
            if (mintMode) {
                // Approve USDT
                const usdInWei = parseUnits(usdQty.toString(), 6);
                await approveContract({
                    chainId: arbitrumSepolia.id,
                    address: USDT_ADDRESS,
                    abi: usdtAbi,
                    functionName: 'approve',
                    args: [ASSET_POOL_ADDRESS, usdInWei],
                });
            } else {
                // Approve Asset
                const assetInWei = parseUnits(assetQty.toString(), 18);
                await approveContract({
                    chainId: arbitrumSepolia.id,
                    address: token.assetAddress,
                    abi: assetAbi,
                    functionName: 'approve',
                    args: [ASSET_POOL_ADDRESS, assetInWei],
                });
            }
        } catch (error) {
            console.error("Approval failed:", error);
        }
    }, [mintMode, usdQty, assetQty, token, approveContract]);

    const executeBuy = useCallback(async () => {
        if (!token?.ticket) {
            throw new Error("Token ticket not available");
        }

        const usdInWei = parseUnits(usdQty.toString(), 6);
        const assetQtyInWei = parseUnits(assetQty.toString(), 18);

        await tradeContract({
            chainId: arbitrumSepolia.id,
            address: ASSET_POOL_ADDRESS,
            functionName: 'mintAsset',
            abi: assetPool,
            args: [usdInWei, token.ticket, assetQtyInWei],
        });
    }, [usdQty, assetQty, token, tradeContract]);

    const executeSell = useCallback(async () => {
        if (!token?.ticket) {
            throw new Error("Token ticket not available");
        }

        const assetInWei = parseUnits(assetQty.toString(), 18);
        const usdQtyInWei = parseUnits(usdQty.toString(), 6);

        await tradeContract({
            chainId: arbitrumSepolia.id,
            address: ASSET_POOL_ADDRESS,
            functionName: 'redeemAsset',
            abi: assetPool,
            args: [assetInWei, token.ticket, usdQtyInWei],
        });
    }, [assetQty, usdQty, token, tradeContract]);

    const handleTrade = useCallback(async () => {
        try {
            if (mintMode) {
                await executeBuy();
            } else {
                await executeSell();
            }
        } catch (error) {
            console.error("Trade failed:", error);
        }
    }, [mintMode, executeBuy, executeSell]);

    useEffect(() => {
        if (price && price > 0) {
            setUsdQty(price);
        }
    }, [price]);

    // Input change handlers
    const handleUsdtChange = useCallback((value) => {
        const numValue = parseFloat(value) || 0;
        setUsdQty(numValue);
        if (price > 0) {
            setAssetQty(parseFloat((numValue / price).toFixed(4)));
        }
    }, [price]);

    const handleAssetChange = useCallback((value) => {
        const numValue = parseFloat(value) || 0;
        setAssetQty(numValue);
        setUsdQty(parseFloat((numValue * price).toFixed(2)));
    }, [price]);

    if (loading || !price || price === 0) {
        return <p>Loading....</p>;
    }

    if (!token) {
        return <p>Token information not available</p>;
    }

    // Input components
    const UsdtInput = () => (
        <div className="border-[#5B6173] border-[1px] rounded-lg">
            <div className="flex flex-col p-4 w-[200px] gap-2">
                <div className="flex justify-between items-center">
                    <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        className="w-full bg-transparent text-white focus:outline-none"
                        onChange={(e) => handleUsdtChange(e.target.value)} 
                        value={usdQty}
                        disabled={isApprovePending || isApprovalConfirming || isTradePending || isTradeConfirming}
                    />
                    <p>USDT</p>
                </div>
            </div>
            <span className="text-xs text-[#5B6173] px-4 pb-2 block">
                Balance: {parseFloat(usdtBalance).toFixed(2)}
            </span>
        </div>
    );

    const AssetInput = () => (
        <div className="border-[#5B6173] border-[1px] rounded-lg">
            <div className="flex flex-col p-4 w-[200px] gap-2">
                <div className="flex justify-between items-center">
                    <input 
                        type="number" 
                        step="0.0001"
                        min="0"
                        className="w-full bg-transparent text-white focus:outline-none"
                        onChange={(e) => handleAssetChange(e.target.value)} 
                        value={assetQty}
                        disabled={isApprovePending || isApprovalConfirming || isTradePending || isTradeConfirming}
                    />
                    <p>{ticket}</p>
                </div>
            </div>
            <span className="text-xs text-[#5B6173] px-4 pb-2 block">
                Balance: {parseFloat(assetBalance).toFixed(4)}
            </span>
        </div>
    );

    // Get button status
    const isAnyPending = isApprovePending || isApprovalConfirming || isTradePending || isTradeConfirming;
    const canTrade = !needsApproval && !isAnyPending && account?.address && usdQty > 0 && assetQty > 0;

    return (
        <div className="">
            <div className="flex flex-col mb-12 justify-center items-center gap-8">
                <div className="flex flex-col md:flex-row md:space-y-0 md:gap-12 items-center gap-6">
                    <button 
                        type="button" 
                        className={`border-[#5B6173] ${mintMode ? "bg-[#102D4A] border-none text-[#127AE2]" : ""} w-[200px] border-[1px] rounded-lg p-4 text-center flex justify-center items-center gap-2 transition-colors`}
                        onClick={() => {
                            setMintMode(true);
                            setSellMode(false);
                        }}
                        disabled={isAnyPending}
                    >
                        Buy
                    </button>

                    <button 
                        type="button" 
                        className={`border-[#5B6173] ${sellMode ? "bg-[#102D4A] border-none text-[#127AE2]" : ""} w-[200px] border-[1px] rounded-lg p-4 text-center flex justify-center items-center gap-2 transition-colors`}
                        onClick={() => {
                            setSellMode(true);
                            setMintMode(false);
                        }}
                        disabled={isAnyPending}
                    >
                        Sell
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                    <div className="transition-all duration-500 ease-in-out">
                        {mintMode ? <UsdtInput /> : <AssetInput />}
                    </div>

                    <div className="transition-all duration-500 ease-in-out">
                        {mintMode ? <AssetInput /> : <UsdtInput />}
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                needsApproval ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                            }`}>
                                {needsApproval ? '1' : '✓'}
                            </div>
                            <span className="text-xs text-gray-400">Approve</span>
                        </div>
                        
                        <div className={`flex-1 h-1 mx-2 ${
                            needsApproval ? 'bg-gray-600' : 'bg-green-600'
                        }`}></div>
                        
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                needsApproval ? 'bg-gray-600 text-gray-400' : canTrade ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                            }`}>
                                {isTradeSuccess ? '✓' : '2'}
                            </div>
                            <span className="text-xs text-gray-400">Trade</span>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {isApprovalConfirming && (
                    <div className="w-full max-w-md p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                        <p className="text-sm text-yellow-400 text-center">
                            ⏳ Waiting for approval confirmation...
                        </p>
                    </div>
                )}

                {isApprovalSuccess && needsApproval && (
                    <div className="w-full max-w-md p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                        <p className="text-sm text-green-400 text-center">
                            ✓ Approval confirmed! Now click "{mintMode ? 'Buy' : 'Sell'}" to complete the trade.
                        </p>
                    </div>
                )}

                {isTradeConfirming && (
                    <div className="w-full max-w-md p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                        <p className="text-sm text-blue-400 text-center">
                            ⏳ Processing your {mintMode ? 'buy' : 'sell'} order...
                        </p>
                    </div>
                )}

                {isTradeSuccess && (
                    <div className="w-full max-w-md p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                        <p className="text-sm text-green-400 text-center">
                            🎉 Trade completed successfully!
                        </p>
                        <p className="text-xs text-green-300 text-center mt-1 break-all">
                            {tradeHash}
                        </p>
                    </div>
                )}

                {(isApproveError || isTradeError) && (
                    <div className="w-full max-w-md p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                        <p className="text-sm text-red-400 text-center break-words">
                            ❌ {(approveError?.shortMessage || tradeError?.shortMessage) || 
                                (approveError?.message || tradeError?.message) || 
                                'Transaction failed'}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex pt-4 flex-col md:flex-row md:space-y-0 space-y-4 md:gap-4 items-center gap-6">
                    {needsApproval ? (
                        <button
                            className={`w-[200px] py-3 font-semibold rounded-lg transition-all ${
                                isApprovePending || isApprovalConfirming
                                    ? 'bg-yellow-600 cursor-wait' 
                                    : 'bg-yellow-500 hover:bg-yellow-600'
                            } text-white`}
                            onClick={handleApprove}
                            disabled={isApprovePending || isApprovalConfirming || !account?.address}
                        >
                            {isApprovePending 
                                ? 'Check Wallet...' 
                                : isApprovalConfirming 
                                ? 'Approving...' 
                                : `Approve ${mintMode ? 'USDT' : ticket}`}
                        </button>
                    ) : (
                        <button
                            className={`w-[200px] py-3 font-semibold rounded-lg transition-all ${
                                !canTrade
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                    : isTradePending || isTradeConfirming
                                    ? 'bg-blue-600 cursor-wait'
                                    : 'bg-[#137FEC] hover:bg-[#1066c4]'
                            } text-white`}
                            onClick={handleTrade}
                            disabled={!canTrade}
                        >
                            {isTradePending 
                                ? 'Check Wallet...' 
                                : isTradeConfirming 
                                ? `${mintMode ? 'Buying' : 'Selling'}...` 
                                : mintMode ? 'Buy' : 'Sell'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}