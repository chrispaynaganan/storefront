import { Badge } from '@/components/ui/Badge'
import type { Address } from '@/types'

export function AddressCard({ address }: { address: Address }) {
  return (
    <div className="bg-white rounded-xl border border-peach-light p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-brown">{address.line1}</p>
        {address.is_default && <Badge variant="peach">Default</Badge>}
      </div>
      {address.line2 && <p className="text-xs text-brown-light">{address.line2}</p>}
      <p className="text-xs text-brown-light">{address.city}, {address.province}</p>
      <p className="text-xs text-brown-light">{address.country} {address.postal_code}</p>
    </div>
  )
}
