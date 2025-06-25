"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ResultSummary from "@/components/ResultSummary"
import SourceAccordion from "@/components/SourceAccordion"
import LoadingSpinner from "@/components/LoadingSpinner"
import CopyButton from "@/components/CopyButton"
import { MapPin, Shield, AlertTriangle, Database, Info } from "lucide-react"
import IPSearchBar from "@/components/IPSearchBar"
import ResultsTabs from "@/components/ResultsTabs"

export default function IPResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialIP = searchParams.get("value") || ""
  const [ip, setIP] = useState(initialIP)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ip) {
      fetchIPData(ip)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ip])

  const fetchIPData = async (ipAddress: string) => {
    try {
      setLoading(true)
      setError(null)

      // grab keys from localStorage
      const vpnKey   = localStorage.getItem("apikey_vpnapi")      || ""
      const vtKey    = localStorage.getItem("apikey_virustotal") || ""
      const abuseKey = localStorage.getItem("apikey_abuseipdb")  || ""

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const response = await fetch(
        `${apiBase}/api/check-ip?ip=${encodeURIComponent(ipAddress)}`, {
          headers: {
            "x-vpnapi-key":     vpnKey,
            "x-virustotal-key": vtKey,
            "x-abuseipdb-key":  abuseKey,
          },
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || "Failed to fetch IP data")
      }

      const data = await response.json()
      console.log("Fetched IP data:", data)

      // fallback permalinks
      if (data.sources?.virustotal && !data.sources.virustotal.permalink) {
        data.sources.virustotal.permalink = `https://www.virustotal.com/gui/ip-address/${ipAddress}`
      }
      if (data.sources?.abuseipdb && !data.sources.abuseipdb.reportLink) {
        data.sources.abuseipdb.reportLink = `https://abuseipdb.com/check/${ipAddress}`
      }

      setResults(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const defangIP = (addr: string) =>
    addr.replace(/\./g, "[.]").replace(/:/g, "[:]")

  // Add this handler for the input bar
  const handleSearch = (newIP: string) => {
    setIP(newIP)
    router.replace(`/ip?value=${encodeURIComponent(newIP)}`)
  }

  const [tab, setTab] = useState(0)
  const tabsRef = useRef<HTMLDivElement>(null)

  // Scroll to tabs when tab changes
  useEffect(() => {
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [tab])

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

  // Define the sources and their configs for tabs
  const sourceTabs = [
    results.sources?.vpnapi && {
      key: "vpnapi",
      label: "VPNAPI",
      content: (
        <SourceAccordion
          title="VPNAPI"
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
      ),
    },
    results.sources?.virustotal && {
      key: "virustotal",
      label: "VirusTotal",
      content: (
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
      ),
    },
    results.sources?.abuseipdb && {
      key: "abuseipdb",
      label: "AbuseIPDB",
      content: (
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
      ),
    },
    results.sources?.iplocation && {
      key: "iplocation",
      label: "Location",
      content: (
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
      ),
    },
    {
      key: "ip2proxy",
      label: "External Links",
      content: (
        <SourceAccordion
          title="More Details (External Links)"
          icon={<Database className="w-5 h-5 text-blue-600" />}
          data={{
            ip2proxy: ip.includes(":")
              ? "https://www.ip2proxy.com/"
              : `https://www.ip2proxy.com/${ip}`,
          }}
          fields={[
            {
              key: "ip2proxy",
              label: (
                <span className="flex items-center gap-1">
                  IP2Proxy Report
                  <span title="Direct IPv6 lookup is not supported. Please paste the IPv6 address on the IP2Proxy website.">
                    <Info className="w-4 h-4 text-blue-400 cursor-pointer" />
                  </span>
                  :
                </span>
              ),
              type: "link",
            },
          ]}
        />
      ),
    },
  ].filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header + Search Bar */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">IP Analysis Results</h1>
        <div className="w-full max-w-md">
          <IPSearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {/* IP + copy */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xl font-mono bg-gray-800 px-4 py-2 rounded-lg">{ip}</span>
        <CopyButton text={defangIP(ip)} label="Copy Defanged IP" />
      </div>

      <div className="space-y-6">
        <ResultSummary
          score={results.summary?.score || 0}
          verdict={results.summary?.verdict || "Unknown"}
          recommendation={results.summary?.recommendation || "No recommendation available"}
          type="ip"
        />

        {/* Add ref here */}
        <div className="space-y-4" ref={tabsRef}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-threat-red" />
            Threat Intelligence Sources
          </h2>

          <ResultsTabs tabs={sourceTabs} />
        </div>
      </div>
    </div>
  )
}
