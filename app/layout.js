import { DM_Sans } from "next/font/google";
import "./globals.css";
import {Providers} from "../providers/providers";

export const metadata = {
  title: "RWA Exchange – Tokenized Stocks on Arbitrum Sepolia",
  description: "Trade tokenized real-world stocks with USDT on Arbitrum Sepolia. Register, fund, and manage your portfolio in a single dApp.",
};

const dm_sans = DM_Sans({
  subsets: ["latin"],
  weight: "400",
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-[#0E0B1C] text-[#C6C4EB] ${dm_sans.className}`}
        >
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}
