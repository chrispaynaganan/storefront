export default function JournalArticlePage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-light text-brown mb-10">{params.slug}</h1>
      <p className="text-brown/50 text-sm">Content coming soon.</p>
    </div>
  )
}