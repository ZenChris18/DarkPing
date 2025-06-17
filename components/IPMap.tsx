"use client"

import { useEffect, useRef } from "react"

interface IPMapProps {
  lat: number
  lng: number
  ip: string
}

export default function IPMap({ lat, lng, ip }: IPMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      if (typeof window === "undefined") return

      const L = (await import("leaflet")).default

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 10)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current)

        L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`IP: ${ip}<br>Location: ${lat}, ${lng}`)
          .openPopup()
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng, ip])

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
