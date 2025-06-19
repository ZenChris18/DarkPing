// api/check-ip/route.ts

import { type NextRequest, NextResponse } from "next/server"

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))$/;

function isValidIP(ip: string) {
  return IPV4_REGEX.test(ip) || IPV6_REGEX.test(ip);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ip = searchParams.get("ip")

  if (!ip) return NextResponse.json({ error: "IP address is required" }, { status: 400 })
  if (!isValidIP(ip)) return NextResponse.json({ error: "Invalid IP address format" }, { status: 400 })

  const vpnKey   = request.headers.get("x-vpnapi-key")       || process.env.VPNAPI_KEY
  const vtKey    = request.headers.get("x-virustotal-key")   || process.env.VIRUSTOTAL_KEY
  const abuseKey = request.headers.get("x-abuseipdb-key")    || process.env.ABUSEIPDB_KEY

  if (!vpnKey || !vtKey || !abuseKey) {
    console.error("Missing one or more API keys")
    return NextResponse.json({ error: "Missing API keys" }, { status: 400 })
  }

  try {
    const [vpnapi, vt, abuse, geo] = await Promise.all([
      fetch(`https://vpnapi.io/api/${ip}?key=${vpnKey}`).then(r => r.json()),
      fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: {
          "x-apikey": vtKey,
          "accept": "application/json",
        },
      }).then(r => r.json()),
      fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
        headers: {
          Key: abuseKey,
          Accept: "application/json",
        },
      }).then(r => r.json()),
      fetch(`https://ipwho.is/${ip}`).then(r => r.json()),
    ])

    const vtStats = vt.data?.attributes?.last_analysis_stats || {}
    const vtTotalVotes = (vtStats.malicious ?? 0) + (vtStats.suspicious ?? 0) + (vtStats.harmless ?? 0) || 1
    const vtMaliciousPercent = ((vtStats.malicious ?? 0) / vtTotalVotes) * 100

    const abuseScore = abuse.data?.abuseConfidenceScore ?? 0

    const flags = [
      vpnapi.security?.vpn,
      vpnapi.security?.proxy,
      vpnapi.security?.tor,
      vpnapi.security?.hosting,
    ].filter(f => f === true).length
    const vpnScore = (flags / 4) * 100

    const rawScore = (vtMaliciousPercent * 0.5) + (abuseScore * 0.3) + (vpnScore * 0.2)
    const summaryScore = Math.round(Math.min(Math.max(rawScore, 0), 100))

    let verdict: "Malicious" | "Suspicious" | "Safe"
    if (summaryScore >= 75) verdict = "Malicious"
    else if (summaryScore >= 40) verdict = "Suspicious"
    else verdict = "Safe"

    const recommendation = {
      Malicious: "Block this IP immediately and investigate sources of traffic.",
      Suspicious: "Monitor connections closely; consider blocking if activity persists.",
      Safe: "No immediate action required; continue normal monitoring.",
    }[verdict]

    const response = {
      summary: {
        score: summaryScore,
        verdict,
        recommendation,
      },
      sources: {
        vpnapi: {
          vpn: vpnapi.security?.vpn ?? false,
          proxy: vpnapi.security?.proxy ?? false,
          tor: vpnapi.security?.tor ?? false,
          hosting: vpnapi.security?.hosting ?? false,
          query: vpnapi.ip ?? ip,
        },
        virustotal: {
          malicious: vtStats.malicious ?? 0,
          suspicious: vtStats.suspicious ?? 0,
          harmless: vtStats.harmless ?? 0,
          reputation: vt.data?.attributes?.reputation ?? 0,
          permalink: `https://www.virustotal.com/gui/ip-address/${ip}/detection`,
        },
        abuseipdb: {
          abuseConfidencePercentage: abuseScore,
          totalReports: abuse.data?.totalReports ?? 0,
          countryCode: abuse.data?.countryCode ?? "N/A",
          isp: abuse.data?.isp ?? "N/A",
          domain: abuse.data?.domain ?? "N/A",
          permalink: `https://www.abuseipdb.com/check/${ip}`,
        },
        iplocation: {
          country: geo.country ?? "N/A",
          region: geo.region ?? "N/A",
          city: geo.city ?? "N/A",
          lat: geo.latitude ?? 0,
          lon: geo.longitude ?? 0,
          isp: geo.connection?.isp ?? "N/A",
          org: geo.connection?.org ?? "N/A",
          timezone: geo.timezone?.id ?? "N/A",
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error checking IP:", error)
    return NextResponse.json({ error: "Failed to analyze IP address" }, { status: 500 })
  }
}
