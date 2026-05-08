'use client'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export function PromoForm() {
  const [isActive, setIsActive] = useState(true)
  return (
    <form className="max-w-md space-y-4">
      <Input label="Promo code" name="code" placeholder="SUMMER20" />
      <Select label="Discount type" name="type"
        options={[{ value: 'percent', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed amount (₱)' }]} />
      <Input label="Value" name="value" type="number" placeholder="20" />
      <Input label="Starts at" name="starts_at" type="datetime-local" />
      <Input label="Ends at" name="ends_at" type="datetime-local" />
      <Toggle checked={isActive} onChange={setIsActive} label="Active" />
      <Button type="submit">Save promo</Button>
    </form>
  )
}
