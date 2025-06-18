export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} DarkPing. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
