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
        className={` bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 ${dm_sans.className}`}
        >
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}
