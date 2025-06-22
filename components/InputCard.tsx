"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface InputCardProps {
  title: string
  description: string
  placeholder: string
  buttonText: string
  icon: ReactNode
  type: "ip" | "hash" | "domain"
}

export default function InputCard({ title, description, placeholder, buttonText, icon, type }: InputCardProps) {
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const extractDomain = (input: string) =>{
  try{
    if (/^https?:\/\//i.test(input)) {
      return new URL(input).hostname
    }
    // Remove trailing slashes and whitespace
    return input.trim().replace(/^\/+|\/+$/g, "")
  } catch {
    return input.trim()
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return

    setIsLoading(true)

    // Navigate to results page
    let route = "/"
    let queryValue = value.trim()
    if (type === "ip") route = "/ip"
    else if (type === "hash") route = "/hash"
    else if (type === "domain") {
      route = "/domain"
      queryValue = extractDomain(queryValue)
    }

    router.push(`${route}?value=${encodeURIComponent(queryValue)}`)
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <p className="text-gray-400 mb-6">{description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`${type}-input`} className="sr-only">
            {title}
          </label>
          <input
            id={`${type}-input`}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="input-field"
            disabled={isLoading}
            aria-describedby={`${type}-description`}
          />
          <div id={`${type}-description`} className="sr-only">
            {description}
          </div>
        </div>

        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? "Analyzing..." : buttonText}
        </button>
      </form>
    </div>
  )
}
