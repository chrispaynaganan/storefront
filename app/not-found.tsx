export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-whitewash">
      <div className="text-center">
        <h1 className="text-6xl font-light text-brown mb-4">404</h1>
        <p className="text-brown-light mb-8">Page not found</p>
        <a href="/" className="text-brown underline">Go home</a>
      </div>
    </div>
  )
}
