// api/check-hash/route.ts

import { type NextRequest, NextResponse } from "next/server"

// Simple hex-hash validation: 32 (MD5), 40 (SHA1), 64 (SHA256)
const HASH_REGEX = /^[A-Fa-f0-9]{32}$|^[A-Fa-f0-9]{40}$|^[A-Fa-f0-9]{64}$/

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash")
  if (!hash) {
    return NextResponse.json({ error: "Hash is required" }, { status: 400 })
  }
  if (!HASH_REGEX.test(hash)) {
    return NextResponse.json({ error: "Invalid hash format" }, { status: 400 })
  }
  if (!process.env.VIRUSTOTAL_KEY) {
    console.error("Missing VIRUSTOTAL_KEY")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  try {
    // Fetch the file report from VirusTotal
    const vtRes = await fetch(
      `https://www.virustotal.com/api/v3/files/${hash}`,
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_KEY,
          accept:    "application/json",
        },
      }
    )
    if (!vtRes.ok) {
      const payload = await vtRes.json().catch(() => ({}))
      console.error("VT API error:", payload)
      return NextResponse.json({ error: "Failed to fetch from VirusTotal" }, { status: vtRes.status })
    }
    const vtJson = await vtRes.json()
    const attr   = vtJson.data.attributes

    // Calculate detection ratio
    const stats              = attr.last_analysis_stats
    const totalEngines       = (stats.malicious ?? 0) + (stats.suspicious ?? 0) + (stats.harmless ?? 0)
    const positiveDetections = (stats.malicious ?? 0) + (stats.suspicious ?? 0)
    const detectionRatio     = totalEngines > 0
      ? Math.round((positiveDetections / totalEngines) * 100)
      : 0

    // Derive filename
    const filename = attr.meaningful_name || "N/A";

    // Verdict thresholds
    let verdict: "Malicious" | "Suspicious" | "Clean"
    if (detectionRatio >= 50) verdict = "Malicious"
    else if (detectionRatio >= 10) verdict = "Suspicious"
    else verdict = "Clean"

    const recommendation = {
      Malicious:   "Block or quarantine this file immediately.",
      Suspicious:  "Quarantine and run further analysis.",
      Clean:       "No known threats detected.",
    }[verdict]

    const response = {
      summary: {
        detectionRatio,
        verdict,
        recommendation,
      },
      sources: {
        virustotal: {
          positives: positiveDetections,
          total:     totalEngines,
          scan_date: new Date(attr.last_analysis_date * 1000).toISOString(),
          permalink: `https://www.virustotal.com/gui/file/${hash}/detection`,
        },
      },
      file_info: {
        name: filename,   // ← new
        md5:    attr.md5,
        sha1:   attr.sha1,
        sha256: attr.sha256,
        type:   attr.type_description,
        size:   attr.size,
        first_seen: new Date(attr.first_submission_date * 1000).toISOString(),
        last_seen:  new Date(attr.last_modification_date  * 1000).toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error("Error in check-hash:", err)
    return NextResponse.json({ error: "Failed to analyze hash" }, { status: 500 })
  }
}
