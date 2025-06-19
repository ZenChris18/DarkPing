"use client"

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">About DarkPing</h1>
      <p className="mb-4 text-gray-300">
        <strong>DarkPing</strong> is a unified threat intelligence platform that lets you check the reputation of IP addresses and file hashes across multiple trusted sources in real time.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2 text-white">How It Works</h2>
      <ul className="list-disc ml-6 text-gray-300 mb-4">
        <li>Enter an IP address (IPv4 or IPv6) or a file hash (MD5, SHA-1, SHA-256).</li>
        <li>DarkPing queries multiple threat intelligence providers and aggregates the results for you.</li>
        <li>All API keys you provide are <span className="text-yellow-400 font-semibold">stored only in your browser</span> and never sent to any server except the official APIs.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2 text-white">Data Sources</h2>
      <ul className="list-disc ml-6 text-gray-300 mb-4">
        <li><strong>VPNAPI.io</strong> — VPN, proxy, and Tor detection</li>
        <li><strong>VirusTotal</strong> — Malware and threat reputation</li>
        <li><strong>AbuseIPDB</strong> — Community IP abuse reports</li>
        <li><strong>IPWhois</strong> — Geolocation and ISP info</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2 text-white">Privacy & Security</h2>
      <p className="text-yellow-400 text-sm mb-4">
        ⚠️ <strong>Your API keys are stored <u>locally</u> in your browser and are never sent to any server except the official threat intelligence APIs you use.<br />
        They are <u>not</u> shared with or stored by this app's developers or any third party.</strong>
      </p>
      <p className="text-gray-400 text-sm">
        For your privacy and security, use dedicated API keys when possible. No scan data or keys are ever stored on our servers.
      </p>
    </div>
  )
}