import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export function ShippingForm() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-brown">Shipping details</h2>
      <Input label="Full name" name="full_name" placeholder="Juan dela Cruz" />
      <Input label="Address line 1" name="line1" placeholder="123 Main St" />
      <Input label="Address line 2 (optional)" name="line2" placeholder="Apt, unit, etc." />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" name="city" placeholder="Manila" />
        <Input label="Province" name="province" placeholder="Metro Manila" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Postal code" name="postal_code" placeholder="1000" />
        <Input label="Country" name="country" defaultValue="Philippines" />
      </div>
      <Input label="Phone" name="phone" placeholder="+63 9XX XXX XXXX" />
    </div>
  )
}
