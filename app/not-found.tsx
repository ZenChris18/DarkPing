import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="card max-w-2xl mx-auto text-center">
        <AlertTriangle className="w-16 h-16 text-threat-red mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="btn-primary inline-block">
          Return Home
        </Link>
      </div>
    </div>
  )
}
