import Link from 'next/link'
import { Twitter, Linkedin, Github } from 'lucide-react'

export default function Footer() {
    return (
      <footer className="bg-[#0E0B1C] py-10 px-6 mt-24">
        <div className="flex items-start justify-between max-w-4xl mx-auto ">
          <div>
            <h3 className="text-gray-900 dark:text-white mb-2">Navigation</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/markets">Markets</Link></li>
              <li><Link href="/assets">Assets</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
  
          <div>
            <h3 className="text-gray-900 dark:text-white mb-2">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
            </ul>
          </div>
  
          <div>
            <h3 className="text-gray-900 dark:text-white mb-2">Follow us</h3>
            <div className="flex gap-4 mt-2">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="w-5 h-5 hover:text-blue-500 transition" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 hover:text-blue-700 transition" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="w-5 h-5 hover:text-blue-700  transition" />
              </a>
            </div>
          </div>
        </div>
  
        <div className="mt-10 border-t border-gray-300 dark:border-gray-700 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} RWA Exchange. All rights reserved.
        </div>
      </footer>
    )
  }