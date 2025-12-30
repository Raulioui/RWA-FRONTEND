import Header from "./components/Header";
import Link from "next/link";
import Footer from "./components/Footer";
import { activeTokens } from "../lib/activeTokens";
import AssetComponentMain from "../app/components/AssetComponentMain";

export default function Home() {
  return (
    <div>
      <Header />

      <section className="mt-32 lg:mt-40 w-[95%] xl:w-[70%] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-10 justify-between items-center lg:items-start">
        <div className="flex flex-col items-center lg:items-start max-w-2xl space-y-6">
          <p className="text-xs tracking-[0.25em] uppercase text-purple-400">
            On-chain RWA Trading
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white leading-[1.2] font-bold text-center lg:text-left">
            Discover Tokenized Real-World Assets
          </h1>

          <p className="text-gray-300 text-sm md:text-base text-center lg:text-left">
            Trade synthetic stock tokens like <span className="font-semibold">dTSLA</span> using The Broker Dollar.
            Every trade is backed by real execution through Alpaca and automated with{" "}
            <span className="font-semibold">Chainlink Functions</span>.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
            <Link
              href="/market"
              className="w-[200px] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition text-center"
            >
              Discover Market
            </Link>

            <Link
              href="/governance"
              className="w-[200px] py-3 border border-purple-500/60 text-purple-300 hover:bg-purple-500/10 font-semibold rounded-lg transition text-center text-sm"
            >
              Explore Governance
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md">
          <p className="text-sm text-gray-400 mb-3 text-center lg:text-right">
            Featured markets
          </p>
          <div className="space-y-3">
            {activeTokens
              .slice(0, 4)
              .map((token) => (
                <AssetComponentMain
                  key={token.name}
                  name={token.name}
                  ticket={token.symbol}
                  image={token.image}
                />
              ))}
          </div>
        </div>
      </section>

      <section className="mt-24">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Trade Real Stocks on the Blockchain
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Buy and sell tokenized versions of real-world stocks using the Broker Dollar.
            The protocol submits orders to a real broker (Alpaca) and syncs positions on-chain.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-white">
                1. Deposit &amp; Mint
              </h3>
              <p className="text-gray-400 text-sm">
                Deposit Broker Dollar and mint tokens like <span className="font-semibold">dTSLA</span>. 
                Each token represents exposure to the underlying real stock.
              </p>
            </div>

            <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-white">
                2. Real Execution
              </h3>
              <p className="text-gray-400 text-sm">
                The protocol uses <span className="font-semibold">Chainlink Functions</span> 
                to call the Alpaca API and execute real trades that back the synthetic tokens.
              </p>
            </div>

            <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-white">
                3. Redeem Anytime
              </h3>
              <p className="text-gray-400 text-sm">
                Redeem your tokens back for Broker Dollar. The protocol unwinds the real-world position 
                and settles on-chain through the AssetPool.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            <div className="bg-[#1E1C34] p-6 md:p-8 rounded-2xl shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-white">
                  Why use this RWA broker?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  The goal is to make real stocks accessible from any EVM wallet, without giving up on 
                  transparency and automation.
                </p>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Fully on-chain accounting through the AssetPool.</li>
                  <li>• One token per asset, simple ERC20 interface.</li>
                  <li>• Clear mint / redeem flows with request tracking.</li>
                  <li>• Upgradable AssetToken implementation via governance.</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#1E1C34] p-6 md:p-8 rounded-2xl shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-white">
                  Governed by BGT holders
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Listing new assets, adjusting timeouts, pausing the protocol or upgrading contracts 
                  is controlled by <span className="font-semibold">on-chain governance</span>.
                </p>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Governance token: <span className="font-semibold">BGT</span>.</li>
                  <li>• Timelock-owned AssetPool for safer upgrades.</li>
                  <li>• Proposals executed only after a delay.</li>
                  <li>• Users can help decide which RWAs are supported.</li>
                </ul>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/governance"
                  className="w-[180px] py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg text-center transition"
                >
                  Go to Governance
                </Link>
                <Link
                  href="/governance/proposals"
                  className="w-[180px] py-2 border border-purple-500/60 text-purple-300 hover:bg-purple-500/10 text-xs font-semibold rounded-lg text-center transition"
                >
                  View Proposals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
