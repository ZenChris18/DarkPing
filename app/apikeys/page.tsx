'use client'

import { Info } from "lucide-react"
import { useEffect, useState } from "react"

const STORAGE_KEYS = {
  vpnapi: "apikey_vpnapi",
  virustotal: "apikey_virustotal",
  abuseipdb: "apikey_abuseipdb",
}

export default function ApiKeyPage() {
  const [vpnapi, setVpnapi] = useState("")
  const [virustotal, setVirustotal] = useState("")
  const [abuseipdb, setAbuseipdb] = useState("")

  useEffect(() => {
    // Load keys on mount
    setVpnapi(localStorage.getItem(STORAGE_KEYS.vpnapi) || "")
    setVirustotal(localStorage.getItem(STORAGE_KEYS.virustotal) || "")
    setAbuseipdb(localStorage.getItem(STORAGE_KEYS.abuseipdb) || "")
  }, [])

  const saveKey = (key: string, value: string) => {
    localStorage.setItem(key, value)
  }

  const clearKeys = () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    setVpnapi("")
    setVirustotal("")
    setAbuseipdb("")
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-white">Manage API Keys</h1>
        <span className="relative group">
          <Info className="w-5 h-5 text-yellow-400 cursor-pointer" />
          <span className="absolute left-6 top-full mt-2 bg-gray-900 text-yellow-400 text-xs rounded px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64">
            <b>Privacy:</b><br />
            • Keys are <u>only</u> stored in your browser.<br />
            • Used just for threat API requests.<br />
            • Clear anytime with the button.<br />
            <span className="text-yellow-300">Use dedicated keys for best security.</span>
          </span>
        </span>
      </div>

      {[
        { label: "VPNAPI", value: vpnapi, onChange: setVpnapi, keyName: STORAGE_KEYS.vpnapi },
        { label: "VirusTotal", value: virustotal, onChange: setVirustotal, keyName: STORAGE_KEYS.virustotal },
        { label: "AbuseIPDB", value: abuseipdb, onChange: setAbuseipdb, keyName: STORAGE_KEYS.abuseipdb },
      ].map(({ label, value, onChange, keyName }) => (
        <div key={label} className="mb-4">
          <label className="block text-sm font-semibold text-gray-300 mb-1">{label} Key</label>
          <input
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder:text-gray-500"
            type="password"
            value={value}
            placeholder={`Enter ${label} API key`}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/</g, "&lt;").replace(/>/g, "&gt;")
              onChange(sanitized)
              saveKey(keyName, sanitized)
            }}
          />
        </div>
      ))}

      <button
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mt-4"
        onClick={clearKeys}
      >
        Clear All Keys
      </button>
    </div>
  )
}
