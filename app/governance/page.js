// app/governance/page.tsx

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function GovernancePage() {
  return (
    <div>
      <Header />

      {/* HERO */}
      <div className="mt-40 w-[95%] xl:w-[70%] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-10 justify-between items-center lg:items-start">
        <div className="flex flex-col items-center lg:items-start max-w-2xl space-y-6">
          <p className="text-xs tracking-[0.25em] uppercase text-purple-400">
            Governance
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white leading-[1.3] font-bold text-center lg:text-left">
            Protocol Governance &amp; BGT Token
          </h1>

          <p className="text-gray-300 text-sm md:text-base text-center lg:text-left">
            Governance controls what assets are listed, which parameters can
            change and when upgrades happen. Everything goes through the{" "}
            <span className="font-semibold">Governor</span>, the{" "}
            <span className="font-semibold">Timelock</span> and the{" "}
            <span className="font-semibold">BGT governance token</span>.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
            <Link
              href="/governance/proposals"
              className="w-[200px] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition text-center"
            >
              View proposals
            </Link>

            <Link
              href="/governance/proposals/create"
              className="w-[200px] py-3 border border-purple-500/60 text-purple-300 hover:bg-purple-500/10 font-semibold rounded-lg transition text-center"
            >
              Create proposal
            </Link>
          </div>
        </div>

        {/* Side info card */}
        <div className="w-full max-w-md space-y-4">
          <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-white">
              How governance is wired
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                • <span className="font-semibold">AssetPool</span>: core
                contract where assets are registered, mint/redeem happens and
                upgrades are controlled.
              </li>
              <li>
                • <span className="font-semibold">TimelockController</span>: the
                owner of <span className="font-semibold">AssetPool</span>. It
                enforces a delay before executing critical changes.
              </li>
              <li>
                • <span className="font-semibold">RWAGovernor</span>: governance
                contract that handles proposals, voting and coordinates with the
                timelock.
              </li>
              <li>
                • <span className="font-semibold">BGT</span>: Broker Governance
                Token. Your voting power depends on how much BGT you have
                delegated.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* HOW A PROPOSAL WORKS */}
      <div className="mt-24 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">
          How an on-chain proposal works
        </h2>
        <p className="text-gray-300 text-center max-w-3xl mx-auto mb-12">
          Important decisions (listing assets, changing risk parameters,
          upgrading contracts, pausing the protocol, etc.) always follow the
          same flow: propose → vote → timelock → execute.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-white">
              Proposal lifecycle
            </h3>
            <ol className="list-decimal list-inside text-gray-300 text-sm space-y-2">
              <li>
                <span className="font-semibold">Propose:</span> a user with BGT
                creates a proposal (e.g. list a new asset).
              </li>
              <li>
                <span className="font-semibold">Voting delay:</span> some blocks
                must pass before voting starts.
              </li>
              <li>
                <span className="font-semibold">Voting period:</span> BGT
                holders vote For / Against / Abstain.
              </li>
              <li>
                <span className="font-semibold">Succeeded:</span> if quorum and
                majority are reached, the proposal becomes Succeeded.
              </li>
              <li>
                <span className="font-semibold">Queue:</span> the proposal is
                queued in the Timelock and must wait the minimum delay.
              </li>
              <li>
                <span className="font-semibold">Execute:</span> the Timelock
                executes the call on the target contract.
              </li>
            </ol>
          </div>

          <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-white">
              Your role as a user
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Receive or acquire BGT through the protocol.</li>
              <li>• Delegate your BGT to activate your voting power.</li>
              <li>• Create proposals if you meet the proposal threshold.</li>
              <li>• Vote on active proposals that change the protocol.</li>
              <li>• Track outcomes in the proposals section.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-24 max-w-6xl mx-auto px-6">
        <div className="bg-[#1E1C34] p-6 md:p-8 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              Broker Governance Token (BGT)
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-4">
              BGT is the governance token of the protocol. It represents your{" "}
              <span className="font-semibold">right to participate</span> in
              key decisions: which assets are supported, what parameters are
              adjusted and which upgrades are deployed.
            </p>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Fixed max supply (e.g. 1,000,000 BGT).</li>
              <li>• Part of the supply is held by the DAO treasury (Timelock).</li>
              <li>
                • Another part is distributed among users to encourage
                participation.
              </li>
              <li>
                • To make your BGT count in votes, you must{" "}
                <span className="font-semibold">delegate</span> it.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Your governance position
            </h3>
            <p className="text-gray-300 text-sm">
              In the governance UI you will be able to see:
            </p>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Your current BGT balance.</li>
              <li>• Your delegated voting power.</li>
              <li>• Which address you delegated to.</li>
            </ul>

          </div>
        </div>
      </div>

      <div className="mt-24 max-w-6xl mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            What can the DAO decide?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            href="/governance/proposals/create"
            className="bg-[#1E1C34] p-6 rounded-2xl shadow-md hover:border-purple-500/70 border border-transparent transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                List a new asset
              </h3>
              <p className="text-gray-300 text-sm">
                Propose the creation of a new RWA token in{" "}
                <span className="font-semibold">AssetPool</span> (name, ticker,
                image).
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-purple-300">
              Create proposal →
            </span>
          </Link>

          <Link
            href="/governance/proposals/create"
            className="bg-[#1E1C34] p-6 rounded-2xl shadow-md hover:border-purple-500/70 border border-transparent transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Update request timeout
              </h3>
              <p className="text-gray-300 text-sm">
                Adjust the{" "}
                <span className="font-semibold">request timeout</span> of
                AssetTokens to control how long an operation can remain pending.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-purple-300">
              Create proposal →
            </span>
          </Link>
          <Link
            href="/governance/proposals/create"
            className="bg-[#1E1C34] p-6 rounded-2xl shadow-md hover:border-purple-500/70 border border-transparent transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Remove an asset
              </h3>
              <p className="text-gray-300 text-sm">
                Propose to delist an asset from the protocol using{" "}
                <code className="bg-black/40 px-1 py-0.5 rounded text-[11px]">
                  removeTokenRegistry
                </code>
                .
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-purple-300">
              Create proposal →
            </span>
          </Link>

          <Link
            href="/governance/proposals/create"
            className="bg-[#1E1C34] p-6 rounded-2xl shadow-md hover:border-purple-500/70 border border-transparent transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Upgrade AssetToken implementation
              </h3>
              <p className="text-gray-300 text-sm">
                Propose a new implementation for all{" "}
                <span className="font-semibold">AssetToken</span> contracts
                through the Beacon.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-purple-300">
              Create proposal →
            </span>
          </Link>

          <Link
            href="/governance/proposals/create"
            className="bg-[#1E1C34] p-6 rounded-2xl shadow-md hover:border-purple-500/70 border border-transparent transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Pause / unpause protocol
              </h3>
              <p className="text-gray-300 text-sm">
                Use{" "}
                <code className="bg-black/40 px-1 py-0.5 rounded text-[11px]">
                  emergencyPause
                </code>{" "}
                and{" "}
                <code className="bg-black/40 px-1 py-0.5 rounded text-[11px]">
                  unpause
                </code>{" "}
                under DAO control to handle emergencies.
              </p>
            </div>
            <span className="mt-4 text-xs font-semibold text-purple-300">
              Create proposal →
            </span>
          </Link>
        </div>

        </div>

      <Footer />
    </div>
  );
}
