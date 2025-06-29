# DarkPing

**DarkPing** is a unified threat intelligence platform that allows you to instantly investigate IP addresses (IPv4 & IPv6) and file hashes (MD5, SHA-1, SHA-256) across multiple reputable threat intelligence providers—all in one privacy-first web app.

---

## Features

- **IP Reputation Check:**  
  Analyze any IPv4 or IPv6 address for VPN/proxy/Tor usage, abuse reports, malware associations, and geolocation.

- **File Hash Analysis:**  
  Cross-reference file hashes against malware databases and threat feeds.

- **Multiple Data Sources:**  
  - VPNAPI.io (VPN/proxy/Tor detection)
  - VirusTotal (malware/threat reputation)
  - AbuseIPDB (community IP abuse reports)
  - IPWhois (geolocation and ISP info)

- **Privacy-First:**  
  - **API keys are stored only in your browser** (local storage).
  - All queries are made directly from your browser to the official APIs.

- **Modern UI:**  
  - Responsive, dark-themed interface built with Next.js and Tailwind CSS.
  - Real-time feedback, copy-to-clipboard, and clear error handling.

---

## Getting Started with Contributions

We welcome contributions to improve DarkPing!  
You can help by submitting bug reports, feature requests, or pull requests to enhance the platform.

### How to Contribute

1. **Fork this repository** and create a new branch for your feature or fix.
2. **Make your changes** and ensure your code follows the existing style and conventions.
3. **Test your changes** locally.  
   - If you want to run the app locally, you can add a `.env.local` file with your own API keys for testing (see below).
   - Otherwise, you can contribute UI/UX improvements, documentation, or bug fixes without running the backend.
4. **Submit a pull request** with a clear description of your changes.

### Environment Variables (for local testing)

If you want to test API integrations on your local machine, create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
# Optionally, set default API keys for local testing (not recommended for production)
# VPNAPI_KEY=your_vpnapi_key
# VIRUSTOTAL_KEY=your_virustotal_key
# ABUSEIPDB_KEY=your_abuseipdb_key
```

> **Note:**  
> When using the hosted site, API keys are stored in your browser and used for requests.  
> If you set environment variables locally, they will be used as a fallback only if no key is found in the browser (see API route logic).

---

## Usage

1. **Set Your API Keys:**  
   Go to the [API Keys](/apikeys) page and enter your keys for each provider.  
   _Keys are stored locally and never leave your browser._

2. **Scan an IP, Hash or Domain:**  
   - Use the home page to enter an IP address, file hash, or domain.
   - View detailed results, verdicts, and recommendations.

3. **Review Results:**  
   - See threat scores, verdicts, and source breakdowns.
   - Copy defanged IPs/hashes for safe sharing.

---

## Security & Privacy

- All keys are stored in your browser's local storage.
- All threat intelligence queries are made directly from your browser.
- You can clear your keys at any time from the API Keys page.

---

## Contributing

Pull requests and issues are welcome!  
Please open an issue to discuss major changes before submitting a PR.

---

## License

MIT License

---

## Credits

- [VPNAPI.io](https://vpnapi.io/)
- [VirusTotal](https://www.virustotal.com/)
- [AbuseIPDB](https://abuseipdb.com/)
- [IPWhois](https://ipwhois.io/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

---
