import Link from "next/link"
import { Shield } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="w-8 h-8 text-threat-red" />
            <span className="text-2xl font-bold text-white">DarkPing</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/apikeys" className="text-gray-300 hover:text-white transition-colors">
              API
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
