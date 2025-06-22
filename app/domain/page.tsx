"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ResultSummary from "@/components/ResultSummary"
import SourceAccordion from "@/components/SourceAccordion"
import LoadingSpinner from "@/components/LoadingSpinner"
import CopyButton from "@/components/CopyButton"
import { Globe, AlertTriangle, Database } from "lucide-react"
import IPSearchBar from "@/components/IPSearchBar"

export default function DomainResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialDomain = searchParams.get("value") || ""
  const [domain, setDomain] = useState(initialDomain)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (domain) fetchDomainData(domain)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain])

  const fetchDomainData = async (domainName: string) => {
    try {
      setLoading(true)
      setError(null)
      const vtKey = localStorage.getItem("apikey_virustotal") || ""
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const response = await fetch(
        `${apiBase}/api/check-domain?domain=${encodeURIComponent(domainName)}`,
        { headers: { "x-virustotal-key": vtKey } }
      )
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || "Failed to fetch domain data")
      }
      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newDomain: string) => {
    setDomain(newDomain)
    router.replace(`/domain?value=${encodeURIComponent(newDomain)}`)
  }

  // Utility to defang a domain or URL
  function defangDomain(input: string) {
    let defanged = input.replace(/^https?:\/\//i, match =>
      match.toLowerCase() === "https://" ? "hxxps://" : "hxxp://"
    )
    defanged = defanged.replace(/\./g, "[.]")
    return defanged
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner message="Analyzing domain..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-threat-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!results || !domain) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">No Domain Provided</h2>
          <p className="text-gray-400">Please provide a valid domain to analyze.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header + Search Bar */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Domain Analysis Results</h1>
        <div className="w-full max-w-md">
          <IPSearchBar
            onSearch={handleSearch}
            placeholder="Enter domain (e.g., example.com)"
            buttonText="Search"
          />
        </div>
      </div>

      {/* Domain + copy */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xl font-mono bg-gray-800 px-4 py-2 rounded-lg">{domain}</span>
        <CopyButton text={defangDomain(domain)} label="Copy Defanged" />
      </div>

      <div className="space-y-6">
        <ResultSummary
          score={results.summary?.detectionRatio || 0}
          verdict={results.summary?.verdict || "Unknown"}
          recommendation={results.summary?.recommendation || "No recommendation available"}
          type="domain"
        />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-threat-red" />
            Domain Intelligence Sources
          </h2>

          {results.sources?.virustotal && (
            <SourceAccordion
              title="VirusTotal"
              icon={<AlertTriangle className="w-5 h-5" />}
              data={results.sources.virustotal}
              fields={[
                { key: "malicious", label: "Malicious Votes", type: "number" },
                { key: "suspicious", label: "Suspicious Votes", type: "number" },
                { key: "harmless", label: "Harmless Votes", type: "number" },
                { key: "reputation", label: "Community Score", type: "number" },
                { key: "permalink", label: "View Report", type: "link" },
              ]}
            />
          )}

          {results.domain_info && (
            <SourceAccordion
              title="Domain Info"
              icon={<Globe className="w-5 h-5 text-blue-400" />}
              data={results.domain_info}
              fields={[
                { key: "registrar", label: "Registrar", type: "text" },
                { key: "creation_date", label: "Created On", type: "date" },
                { key: "categories", label: "Categories", type: "json" },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}