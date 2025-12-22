"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import icon from "../../public/icon.svg";
import menu from "../../public/menu.svg";
import close from "../../public/close.svg";

const NAV_LINKS = [
  { href: "/market", label: "Market" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/governance", label: "Governance" },
  { href: "/governance/proposals", label: "Proposals" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  if (showMenu) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0E0B1C]/95 backdrop-blur-md px-6 py-6">
        <header className="flex justify-between items-center w-full">
          <button
            className="flex items-center gap-3 hover:opacity-90 transition"
            onClick={() => {
              setShowMenu(false);
              router.push("/");
            }}
          >
            <Image
              src={icon}
              width={36}
              height={36}
              alt="RWA Exchange logo"
              priority
            />
            <div className="text-left">
              <h1 className="text-[#CECCF6] font-bold text-base">
                RWA Exchange
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.18em]">
                Tokenized Stocks
              </p>
            </div>
          </button>

          <button
            className="bg-[#1A1B1F] p-2 rounded-lg hover:bg-[#252633] transition"
            onClick={() => setShowMenu(false)}
            aria-label="Close navigation"
          >
            <Image src={close} height={22} width={22} alt="close menu" />
          </button>
        </header>

        <nav className="mt-12 flex flex-col gap-8 text-lg">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setShowMenu(false)}
              className={`${
                isActive(link.href)
                  ? "text-white font-semibold"
                  : "text-gray-300"
              } hover:text-white transition`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-4">
          <p className="text-xs text-gray-400 mb-1">
            Connect your wallet to start trading tokenized stocks and
            participate in governance.
          </p>
          <ConnectButton
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            showBalance={false}
          />
        </div>
      </div>
    );
  }

  return (
    <header className="flex justify-between items-center px-6 md:px-10 py-6">
      {/* Logo */}
      <button
        className="flex items-center gap-3 hover:opacity-90 transition"
        onClick={() => router.push("/")}
      >
        <Image
          src={icon}
          width={35}
          height={35}
          alt="RWA Exchange logo"
          priority
        />
        <div className="text-left">
          <h1 className="text-[#CECCF6] font-bold text-sm md:text-lg">
            RWA Exchange
          </h1>
          <p className="hidden md:block text-[10px] text-gray-400 uppercase tracking-[0.18em]">
            On-chain RWA Broker
          </p>
        </div>
      </button>

      {/* Desktop nav */}
      <nav className="hidden lg:flex flex-row gap-6 items-center text-sm">
        <div className="flex items-center gap-2 bg-[#151327] border border-white/5 rounded-full px-3 py-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded-full transition text-xs ${
                isActive(link.href)
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Right side: wallet + mobile menu */}
      <div className="flex gap-3 items-center">
        <div className="hidden sm:block">
          <ConnectButton
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            showBalance={false}
          />
        </div>

        {/* Mobile connect (icon) */}
        <div className="sm:hidden">
          <ConnectButton
            accountStatus="avatar"
            showBalance={false}
          />
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden bg-[#1A1B1F] p-2 rounded-lg hover:bg-[#252633] transition"
          onClick={() => setShowMenu(true)}
          aria-label="Open navigation"
        >
          <Image src={menu} height={26} width={26} alt="open menu" />
        </button>
      </div>
    </header>
  );
}
