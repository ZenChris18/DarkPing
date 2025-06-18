"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ResultSummary from "@/components/ResultSummary"
import SourceAccordion from "@/components/SourceAccordion"
import LoadingSpinner from "@/components/LoadingSpinner"
import CopyButton from "@/components/CopyButton"
import { FileSearch, AlertTriangle, Database, Bug } from "lucide-react"
import GoHomeButton from "@/components/Button"

export default function HashResultsPage() {
  const searchParams = useSearchParams()
  const hashParam = searchParams.get("value") || ""
  
  const [hash, setHash] = useState(hashParam)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Validate MD5 / SHA-1 / SHA-256 hex lengths
  const isValidHash = (h: string) => {
    return /^[A-Fa-f0-9]{32}$/.test(h)   // MD5
        || /^[A-Fa-f0-9]{40}$/.test(h)   // SHA-1
        || /^[A-Fa-f0-9]{64}$/.test(h)   // SHA-256
  }

  useEffect(() => {
    setHash(hashParam)
    setResults(null)
    setError(null)

    if (!hashParam) return

    if (!isValidHash(hashParam)) {
      setError("Please enter a valid MD5 (32 chars), SHA‑1 (40 chars), or SHA‑256 (64 chars) hash.")
      return
    }

    // All good — fetch data
    fetchHashData(hashParam)
  }, [hashParam])

  const fetchHashData = async (hashValue: string) => {
    try {
      setLoading(true)
      setError(null)

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const res = await fetch(`${apiBase}/api/check-hash?hash=${encodeURIComponent(hashValue)}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch hash data (${res.status})`)
      }
      const data = await res.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // --- RENDERING ---

  // No hash in URL
  if (!hash) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">No Hash Provided</h2>
        <p className="text-gray-400">
          Append <code>?value=&lt;md5|sha1|sha256&gt;</code> to the URL.
        </p>
      </div>
    )
  }

  // Validation error
  if (error && !loading && !results) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-16 h-16 text-threat-red mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Invalid Hash</h2>
        <p className="text-red-400">{error}</p>
        <p className="text-gray-400 mt-2">Ensure it’s 32, 40, or 64 hex characters.</p>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner message="Analyzing file hash..." />
      </div>
    )
  }

  // API error
  if (error && !loading && results === null) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-16 h-16 text-threat-red mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  // No results (shouldn't happen if no error/loading)
  if (!results) {
    return null
  }

  // Success: show results
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Hash Analysis Results</h1>
        <GoHomeButton />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-sm font-mono bg-gray-800 px-4 py-2 rounded-lg break-all">
          {hash}
        </span>
        <CopyButton text={hash} label="Copy Hash" />
      </div>


      <div className="space-y-6">
        <ResultSummary
          score={results.summary?.detectionRatio || 0}
          verdict={results.summary?.verdict || "Unknown"}
          recommendation={results.summary?.recommendation || "No recommendation available"}
          type="hash"
        />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-threat-red" />
            Malware Analysis Sources
          </h2>

          {results.sources?.virustotal && (
            <>
              <SourceAccordion
                title="VirusTotal"
                icon={<AlertTriangle className="w-5 h-5" />}
                data={results.sources.virustotal}
                fields={[
                  { key: "positives", label: "Detections", type: "number" },
                  { key: "total", label: "Total Engines", type: "number" },
                  { key: "scan_date", label: "Scan Date", type: "date" },
                  { key: "permalink", label: "Report Link", type: "link" },
                ]}
              />
            </>
          )}

          {results.sources?.hybridanalysis && (
            <SourceAccordion
              title="Hybrid Analysis"
              icon={<Bug className="w-5 h-5" />}
              data={results.sources.hybridanalysis}
              fields={[
                { key: "verdict", label: "Verdict", type: "text" },
                { key: "threat_score", label: "Threat Score", type: "number" },
                { key: "av_detect", label: "AV Detection", type: "percentage" },
                { key: "type_short", label: "File Type", type: "text" },
                { key: "size", label: "File Size", type: "bytes" },
                { key: "submit_name", label: "Original Name", type: "text" },
              ]}
            />
          )}

          {results.file_info && (
            <SourceAccordion
              title="File Information"
              icon={<FileSearch className="w-5 h-5" />}
              data={results.file_info}
              fields={[
                { key: "name", label: "File Name", type: "text" },
                { key: "size", label: "File Size", type: "bytes" },
                { key: "type", label: "File Type", type: "text" },
                { key: "first_seen", label: "First Seen", type: "date" },
                { key: "last_seen", label: "Last Seen", type: "date" },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}
