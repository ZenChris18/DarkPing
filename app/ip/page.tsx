"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ResultSummary from "@/components/ResultSummary"
import SourceAccordion from "@/components/SourceAccordion"
import LoadingSpinner from "@/components/LoadingSpinner"
import IPMap from "@/components/IPMap"
import CopyButton from "@/components/CopyButton"
import { MapPin, Shield, AlertTriangle, Database } from "lucide-react"

export default function IPResultsPage() {
  const searchParams = useSearchParams()
  const ip = searchParams.get("value")
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ip) {
      fetchIPData(ip)
    }
  }, [ip])

  const fetchIPData = async (ipAddress: string) => {
    try {
      setLoading(true)
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const response = await fetch(`${apiBase}/api/check-ip?ip=${encodeURIComponent(ipAddress)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch IP data")
      }

      const data = await response.json()

      // Debug: log what we got
      console.log("Fetched IP data:", data)

      // Patch missing links if backend isnt working
      if (data.sources?.virustotal && !data.sources.virustotal.permalink) {
        data.sources.virustotal.permalink = `https://www.virustotal.com/gui/ip-address/${ip}`
      }

      if (data.sources?.abuseipdb && !data.sources.abuseipdb.reportLink) {
        data.sources.abuseipdb.reportLink = `https://abuseipdb.com/check/${ip}`
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const defangIP = (ip: string) => ip.replace(/\./g, "[.]")

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner message="Analyzing IP address..." />
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

  if (!results || !ip) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">No IP Address Provided</h2>
          <p className="text-gray-400">Please provide a valid IP address to analyze.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">IP Analysis Results</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xl font-mono bg-gray-800 px-4 py-2 rounded-lg">{ip}</span>
          <CopyButton text={defangIP(ip)} label="Copy Defanged IP" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ResultSummary
            score={results.summary?.score || 0}
            verdict={results.summary?.verdict || "Unknown"}
            recommendation={results.summary?.recommendation || "No recommendation available"}
            type="ip"
          />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-threat-red" />
              Threat Intelligence Sources
            </h2>

            {results.sources?.vpnapi && (
              <SourceAccordion
                title="VPN & Proxy Detection"
                icon={<Shield className="w-5 h-5" />}
                data={results.sources.vpnapi}
                fields={[
                  { key: "vpn", label: "VPN Detected", type: "boolean" },
                  { key: "proxy", label: "Proxy Detected", type: "boolean" },
                  { key: "tor", label: "Tor Exit Node", type: "boolean" },
                  { key: "hosting", label: "Hosting Provider", type: "boolean" },
                  { key: "query", label: "IP Address", type: "text" },
                ]}
              />
            )}

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

            {results.sources?.abuseipdb && (
              <SourceAccordion
                title="AbuseIPDB"
                icon={<AlertTriangle className="w-5 h-5" />}
                data={results.sources.abuseipdb}
                fields={[
                  { key: "abuseConfidencePercentage", label: "Abuse Confidence", type: "percentage" },
                  { key: "totalReports", label: "Total Reports", type: "number" },
                  { key: "countryCode", label: "Country", type: "text" },
                  { key: "isp", label: "ISP", type: "text" },
                  { key: "domain", label: "Domain", type: "text" },
                  { key: "reportLink", label: "View Report", type: "link" },
                ]}
              />
            )}

            {results.sources?.iplocation && (
              <SourceAccordion
                title="Location Information"
                icon={<MapPin className="w-5 h-5 text-blue-500" />}
                data={results.sources.iplocation}
                fields={[
                  { key: "country", label: "Country", type: "text" },
                  { key: "region", label: "Region / State", type: "text" },
                  { key: "city", label: "City", type: "text" },
                  { key: "isp", label: "Internet Provider (ISP)", type: "text" },
                  { key: "org", label: "Organization Name", type: "text" },
                  { key: "timezone", label: "Timezone", type: "text" },
                ]}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {results.sources?.iplocation?.lat && results.sources?.iplocation?.lon && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-threat-red" />
                Geographic Location
              </h3>
              <IPMap lat={results.sources.iplocation.lat} lng={results.sources.iplocation.lon} ip={ip} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
