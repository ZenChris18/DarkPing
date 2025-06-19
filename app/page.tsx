"use client" 

import { useEffect, useState } from "react"
import InputCard from "@/components/InputCard"
import { Shield, FileSearch } from "lucide-react"

export default function Home() {
  const [missingKeys, setMissingKeys] = useState(false)

  useEffect(() => {
    const missing =
      !localStorage.getItem("apikey_vpnapi") ||
      !localStorage.getItem("apikey_virustotal") ||
      !localStorage.getItem("apikey_abuseipdb")
    setMissingKeys(missing)
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Unified Threat Intelligence Scanner
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Instantly investigate IP addresses and file hashes across multiple threat intel providers — all in one place.
        </p>
        {missingKeys && (
          <p className="text-sm text-yellow-400 mt-4">
            ⚠️ Some API keys are missing. <a href="/apikeys" className="underline">Set them here</a>.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <InputCard
          title="IP Reputation Check"
          description="Check if an IP is flagged as malicious, a VPN, or a known threat actor."
          placeholder="Enter IP address (e.g., 8.8.8.8)"
          buttonText="Scan IP"
          icon={<Shield className="w-8 h-8 text-threat-red" />}
          type="ip"
        />

        <InputCard
          title="File Hash Analysis"
          description="Cross-reference MD5, SHA-1, or SHA-256 hashes against malware databases."
          placeholder="Enter hash (e.g., d41d8cd98f00b204...)"
          buttonText="Scan Hash"
          icon={<FileSearch className="w-8 h-8 text-threat-red" />}
          type="hash"
        />
      </div>

      <div className="mt-16 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">4+</div>
            <div className="text-gray-400">Intel Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">99.9%</div>
            <div className="text-gray-400">Service Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">Real-Time</div>
            <div className="text-gray-400">Scanning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">Secure</div>
            <div className="text-gray-400">Data Handling</div>
          </div>
        </div>
      </div>
    </div>
  )
}
