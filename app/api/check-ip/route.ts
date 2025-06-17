// api/check-ip/route.ts

import { type NextRequest, NextResponse } from "next/server";

// Simple IPv4 regex for server‑side validation
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ip = searchParams.get("ip");

  if (!ip) {
    return NextResponse.json({ error: "IP address is required" }, { status: 400 });
  }
  if (!IPV4_REGEX.test(ip)) {
    return NextResponse.json({ error: "Invalid IPv4 address format" }, { status: 400 });
  }

  // Ensure your secret keys are present
  if (!process.env.VPNAPI_KEY || !process.env.VIRUSTOTAL_KEY || !process.env.ABUSEIPDB_KEY) {
    console.error("Missing one or more API keys");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    // Parallel fetches
    const [vpnapi, vt, abuse, geo] = await Promise.all([
      fetch(`https://vpnapi.io/api/${ip}?key=${process.env.VPNAPI_KEY}`).then(r => r.json()),
      fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_KEY,
          "accept": "application/json",
        },
      }).then(r => r.json()),
      fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
        headers: {
          Key: process.env.ABUSEIPDB_KEY,
          Accept: "application/json",
        },
      }).then(r => r.json()),
      fetch(`https://ipwho.is/${ip}`).then(r => r.json()),
    ]);

    // 1) VirusTotal stats
    const vtStats = vt.data?.attributes?.last_analysis_stats || {};
    const vtTotalVotes = (vtStats.malicious || 0) + (vtStats.suspicious || 0) + (vtStats.harmless || 0) || 1;
    const vtMaliciousPercent = ((vtStats.malicious || 0) / vtTotalVotes) * 100;

    // 2) AbuseIPDB score (0–100)
    const abuseScore = abuse.data?.abuseConfidenceScore ?? 0;

    // 3) VPNAPI flags score: proportion of true flags ×100
    const flags = [
      vpnapi.security?.vpn,
      vpnapi.security?.proxy,
      vpnapi.security?.tor,
      vpnapi.security?.hosting,
    ].filter(f => f === true).length;
    const vpnScore = (flags / 4) * 100;

    // Weighted average: 50% VT, 30% AbuseIPDB, 20% VPNAPI
    const rawScore = (vtMaliciousPercent * 0.5) + (abuseScore * 0.3) + (vpnScore * 0.2);
    const summaryScore = Math.round(Math.min(Math.max(rawScore, 0), 100)); // clamp to [0,100]

    // Verdict thresholds
    let verdict: "Malicious" | "Suspicious" | "Safe";
    if (summaryScore >= 75) verdict = "Malicious";
    else if (summaryScore >= 40) verdict = "Suspicious";
    else verdict = "Safe";

    // Recommendation based on verdict
    const recommendation = {
      Malicious: "Block this IP immediately and investigate sources of traffic.",
      Suspicious: "Monitor connections closely; consider blocking if activity persists.",
      Safe: "No immediate action required; continue normal monitoring.",
    }[verdict];

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
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking IP:", error);
    return NextResponse.json({ error: "Failed to analyze IP address" }, { status: 500 });
  }
}
