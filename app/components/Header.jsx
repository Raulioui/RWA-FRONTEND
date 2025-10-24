"use client"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import icon from "../../public/icon.svg";
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import menu from "../../public/menu.svg";
import close from "../../public/close.svg";
import { useState } from 'react';

export default function Header() {
    const router = useRouter()
    const [showMenu, setShowMenu] = useState(false)

    if(showMenu) return (
        <div className='fixed inset-0 flex flex-col items-start p-10 bg-[#0E0B1C] bg-opacity-100'>
            <header className='flex justify-between items-center w-full'>
                <div className='flex items-center gap-6 hover:cursor-pointer' onClick={() => router.push('/')}>
                    <Image layout='intrinsic' src={icon} className='w-8 h-8 md:w-10 md:h-10 xl:w-12 xl:h-12' alt="rwa-dex" />
                    <h1 className="text-[#CECCF6] font-bold text-sm md:text-lg xl:text-xl">RWA Exchange</h1>
                </div>

                
                <div className='bg-[#1A1B1F] p-2 rounded-lg hover:cursor-pointer'>
                    <Image onClick={() => setShowMenu(false)} src={close} height={25} width={25} alt="close-menu"/>
                </div>
            </header>

            <div className='mt-20 flex flex-col gap-12'>
                <Link className='hover:text-white duration-100 ease-in-out' href="/market">Market</Link>
                <Link className='hover:text-white duration-100 ease-in-out' href="/portfolio">Portfolio</Link>
            </div>
        </div>
        
    )

    return (
        <header className='flex justify-between items-center p-10'>
            <div className='flex items-center gap-6 hover:cursor-pointer' onClick={() => router.push('/')}>
                <Image src={icon} width={35} height={35} />
                <h1 className="text-[#CECCF6] font-bold text-sm md:text-lg xl:text-xl">RWA Exchange</h1>
            </div>

            <div className='flex flex-row gap-12 items-center hidden lg:flex'>
                <Link className='hover:text-white duration-100 ease-in-out' href="/market">Market</Link>
                <Link className='hover:text-white duration-100 ease-in-out' href="/portfolio">Portfolio</Link>
            </div>

            <div className='flex gap-2 items-center'>
                <ConnectButton
                    accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                    }} 
                    showBalance={false} 
                />

                <div className='lg:hidden bg-[#1A1B1F] p-2 rounded-lg hover:cursor-pointer'>
                    <Image onClick={() => setShowMenu(true)} src={menu} height={30} width={30} alt="menu"/>
                </div>
            </div>
        </header>
    )
}