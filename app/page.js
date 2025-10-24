import Header from './components/Header';
import Link from 'next/link';
import Footer from './components/Footer';
import {activeTokens} from "../lib/activeTokens";
import AssetComponentMain from '../app/components/ui/AssetComponentMain';

export default function Home() {

  return (
    <div>
      <Header />

      <div className='mt-48 w-[95%] xl:w-[70%] mx-auto flex flex-col lg:flex-row gap-20 lg:gap-0  justify-between items-center lg:items-start'>

        <div className=' flex flex-col items-center justify-between max-w-2xl'>
          <h1 className="text-6xl text-white leading-[1.5] font-bold mb-4 text-center">
            Discover Tokenized Real-World Assets
          </h1>
          <div className="flex space-x-4">
            <Link href="/market" className="w-[200px] mt-18 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition text-center">
              Discover Market
            </Link>
          </div>
        </div>

        <div>
          {activeTokens
            .slice(0, 4)          
            .map((token) => (
              <AssetComponentMain
                key={token.name}
                name={token.name}
                ticket={token.symbol}
                image={token.image}
              />
            ))
          }
        </div>
      </div>

      <div className="mt-32">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Trade Real Stocks on the Blockchain
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
          Buy and sell tokenized versions of real-world stocks like TSLA using USDT. Backed by real asset execution through Alpaca and secured with Chainlink Functions.
        </p>

        <div className="mt-32  grid grid-cols-1 md:grid-cols-2 gap-10 text-left">

          <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">Synthetic Stock Tokens</h3>
            <p className="text-gray-400">
              Each stock is represented by an ERC20 token (e.g., dTSLA) backed by real stock purchases executed through Alpaca.
            </p>
          </div>

          <div className="bg-[#1E1C34] p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">Chainlink Integration</h3>
            <p className="text-gray-400">
              Chainlink Functions securely fetch external stock data and trigger trades, ensuring transparency and decentralization.
            </p>
          </div>
        </div>
      </div>
    </div>

      <Footer />
    </div>
  );
}
