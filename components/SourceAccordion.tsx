"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

interface Field {
  key: string
  label: string
  type: "text" | "number" | "boolean" | "percentage" | "date" | "link" | "bytes"
}

interface SourceAccordionProps {
  title: string
  icon: ReactNode
  data: any
  fields: Field[]
}

export default function SourceAccordion({ title, icon, data, fields }: SourceAccordionProps) {
  const [isOpen, setIsOpen] = useState(true) // change to false if you want it closed by default

  const formatValue = (value: any, type: Field["type"]) => {
    if (value === null || value === undefined) return "N/A"

    switch (type) {
      case "boolean":
        return value ? "Yes" : "No"
      case "percentage":
        return `${value}%`
      case "date":
        return new Date(value).toLocaleDateString()
      case "link":
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-threat-red hover:underline">
            View Report
          </a>
        )
      case "bytes":
        return formatBytes(value)
      case "number":
        return typeof value === "number" ? value.toLocaleString() : value
      default:
        return value.toString()
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-threat-red rounded-lg p-2 -m-2"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid gap-3">
            {fields.map((field) => (
              <div key={field.key} className="flex justify-between items-center py-2">
                <span className="text-gray-400">{field.label}:</span>
                <span className="text-white font-medium">{formatValue(data[field.key], field.type)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
