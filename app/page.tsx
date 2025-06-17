import InputCard from "@/components/InputCard"
import { Shield, FileSearch } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Advanced Threat Intelligence
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Analyze IP addresses and file hashes against multiple threat intelligence sources
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <InputCard
          title="Check IP Address"
          description="Analyze IP reputation across multiple threat intelligence sources"
          placeholder="Enter IP address (e.g., 192.168.1.1)"
          buttonText="Scan IP"
          icon={<Shield className="w-8 h-8 text-threat-red" />}
          type="ip"
        />

        <InputCard
          title="Check File Hash"
          description="Verify file hashes against malware databases"
          placeholder="Enter MD5/SHA-1/SHA-256 hash"
          buttonText="Scan Hash"
          icon={<FileSearch className="w-8 h-8 text-threat-red" />}
          type="hash"
        />
      </div>

      <div className="mt-16 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">4+</div>
            <div className="text-gray-400">Data Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">Real-time</div>
            <div className="text-gray-400">Analysis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-threat-red">Secure</div>
            <div className="text-gray-400">Platform</div>
          </div>
        </div>
      </div>
    </div>
  )
}
