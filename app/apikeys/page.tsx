'use client'

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
      <h1 className="text-3xl font-bold mb-6 text-white">Manage API Keys</h1>

      <p className="text-sm text-yellow-400 mb-6">
        ⚠️ <strong>Your API keys are stored <u>locally</u> in your browser and are never sent to any server except the official threat intelligence APIs you use.<br />
        They are <u>not</u> shared with or stored by this app's developers or any third party.</strong>
        <br />
        For your privacy and security, use dedicated API keys when possible.
      </p>

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
