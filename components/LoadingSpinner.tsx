interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-threat-red rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-threat-red rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
      </div>
      <p className="mt-4 text-gray-400 text-lg">{message}</p>
    </div>
  )
}
