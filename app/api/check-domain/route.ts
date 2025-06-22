import { type NextRequest, NextResponse } from "next/server"

const DOMAIN_REGEX = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain")
  if (!domain) return NextResponse.json({ error: "Domain is required" }, { status: 400 })
  if (!DOMAIN_REGEX.test(domain)) return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })

  const vtKey = request.headers.get("x-virustotal-key") || process.env.VIRUSTOTAL_KEY
  if (!vtKey) return NextResponse.json({ error: "Missing VirusTotal API key" }, { status: 400 })

  try {
    const vtRes = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      headers: {
        "x-apikey": vtKey,
        "accept": "application/json",
      },
    })

    if (!vtRes.ok) {
      const payload = await vtRes.json().catch(() => ({}))
      return NextResponse.json({ error: "Failed to fetch from VirusTotal" }, { status: vtRes.status })
    }

    const vtJson = await vtRes.json()
    const attr = vtJson.data.attributes
    const stats = attr.last_analysis_stats || {}

    const totalEngines = (stats.malicious ?? 0) + (stats.suspicious ?? 0) + (stats.harmless ?? 0)
    const positiveDetections = (stats.malicious ?? 0) + (stats.suspicious ?? 0)
    const detectionRatio = totalEngines > 0
      ? Math.round((positiveDetections / totalEngines) * 100)
      : 0

    let verdict: "Malicious" | "Suspicious" | "Clean"
    if (detectionRatio >= 50) verdict = "Malicious"
    else if (detectionRatio >= 10) verdict = "Suspicious"
    else verdict = "Clean"

    const recommendation = {
      Malicious: "Block this domain immediately.",
      Suspicious: "Monitor and restrict access to this domain.",
      Clean: "No known threats detected.",
    }[verdict]

    const response = {
      summary: {
        detectionRatio,
        verdict,
        recommendation,
      },
      sources: {
        virustotal: {
          malicious: stats.malicious ?? 0,
          suspicious: stats.suspicious ?? 0,
          harmless: stats.harmless ?? 0,
          reputation: attr.reputation ?? 0,
          permalink: `https://www.virustotal.com/gui/domain/${domain}/detection`,
        },
      },
      domain_info: {
        registrar: attr.registrar || "N/A",
        creation_date: attr.creation_date ? new Date(attr.creation_date * 1000).toISOString() : "N/A",
        last_dns_records: attr.last_dns_records || [],
        categories: attr.categories || {},
      },
    }

    return NextResponse.json(response)
  } catch (err) {
    return NextResponse.json({ error: "Failed to analyze domain" }, { status: 500 })
  }
}