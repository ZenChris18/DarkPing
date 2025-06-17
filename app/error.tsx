"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="card max-w-2xl mx-auto text-center">
        <AlertTriangle className="w-16 h-16 text-threat-red mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-6">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
      </div>
    </div>
  )
}
