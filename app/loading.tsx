import LoadingSpinner from "@/components/LoadingSpinner"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <LoadingSpinner message="Loading..." />
    </div>
  )
}
