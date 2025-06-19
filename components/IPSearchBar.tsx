import React, { useState } from "react"

interface IPSearchBarProps {
  initialValue?: string
  onSearch: (ip: string) => void
  placeholder?: string
  buttonText?: string
}

const IPSearchBar: React.FC<IPSearchBarProps> = ({
  initialValue = "",
  onSearch,
  placeholder = "Enter new IP address (e.g., 8.8.8.8)",
  buttonText = "Search",
}) => {
  const [inputValue, setInputValue] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSearch(inputValue.trim())
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-4 mb-8 max-w-lg mx-auto"
    >
      <input
        type="text"
        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none"
        placeholder={placeholder}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />
      <button
        type="submit"
        className="bg-threat-red text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
      >
        {buttonText}
      </button>
    </form>
  )
}

export default IPSearchBar