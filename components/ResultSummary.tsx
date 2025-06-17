import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface ResultSummaryProps {
  score: number
  verdict: string
  recommendation: string
  type: "ip" | "hash"
}

export default function ResultSummary({ score, verdict, recommendation, type }: ResultSummaryProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case "safe":
      case "clean":
        return "text-green-400"
      case "malicious":
      case "suspicious":
        return "text-threat-red"
      case "unknown":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case "safe":
      case "clean":
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case "malicious":
      case "suspicious":
        return <XCircle className="w-8 h-8 text-threat-red" />
      case "unknown":
        return <AlertTriangle className="w-8 h-8 text-yellow-400" />
      default:
        return <Shield className="w-8 h-8 text-gray-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-threat-red"
    if (score >= 50) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analysis Summary</h2>
        {getVerdictIcon(verdict)}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            <span className={getScoreColor(score)}>{type === "hash" ? `${score}/100` : score}</span>
          </div>
          <div className="text-gray-400">{type === "hash" ? "Detection Ratio" : "Threat Score"}</div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold mb-2 ${getVerdictColor(verdict)}`}>{verdict}</div>
          <div className="text-gray-400">Verdict</div>
        </div>

        <div className="text-center md:col-span-1">
          <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
            <strong>Recommendation:</strong> {recommendation}
          </div>
        </div>
      </div>
    </div>
  )
}
