interface Props { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-light text-brown mb-6">Order #{id}</h1>
    </div>
  )
}
