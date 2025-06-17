"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface CopyButtonProps {
  text: string
  label?: string
}

export default function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <button onClick={handleCopy} className="btn-secondary flex items-center gap-2" aria-label={`${label}: ${text}`}>
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  )
}
