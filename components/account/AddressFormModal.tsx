'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Country configs — add more as needed
const COUNTRY_CONFIGS: Record<string, {
  provinceLabel: string
  postalLabel: string
  showProvince: boolean
  postalPattern?: string
  postalPlaceholder: string
}> = {
  Philippines: {
    provinceLabel: 'Province',
    postalLabel: 'ZIP code',
    showProvince: true,
    postalPattern: '[0-9]{4}',
    postalPlaceholder: '1234',
  },
  'United States': {
    provinceLabel: 'State',
    postalLabel: 'ZIP code',
    showProvince: true,
    postalPattern: '[0-9]{5}(-[0-9]{4})?',
    postalPlaceholder: '90210',
  },
  'United Kingdom': {
    provinceLabel: 'County',
    postalLabel: 'Postcode',
    showProvince: true,
    postalPattern: '[A-Za-z]{1,2}[0-9][0-9A-Za-z]?\\s?[0-9][A-Za-z]{2}',
    postalPlaceholder: 'SW1A 1AA',
  },
  Canada: {
    provinceLabel: 'Province',
    postalLabel: 'Postal code',
    showProvince: true,
    postalPattern: '[A-Za-z][0-9][A-Za-z]\\s?[0-9][A-Za-z][0-9]',
    postalPlaceholder: 'K1A 0A9',
  },
  Australia: {
    provinceLabel: 'State',
    postalLabel: 'Postcode',
    showProvince: true,
    postalPattern: '[0-9]{4}',
    postalPlaceholder: '2000',
  },
  Japan: {
    provinceLabel: 'Prefecture',
    postalLabel: 'Postal code',
    showProvince: true,
    postalPattern: '[0-9]{3}-?[0-9]{4}',
    postalPlaceholder: '100-0001',
  },
  Singapore: {
    provinceLabel: 'District',
    postalLabel: 'Postal code',
    showProvince: false,
    postalPattern: '[0-9]{6}',
    postalPlaceholder: '018956',
  },
  'Hong Kong': {
    provinceLabel: 'District',
    postalLabel: 'Postal code',
    showProvince: true,
    postalPlaceholder: '',
  },
  Other: {
    provinceLabel: 'State / Province / Region',
    postalLabel: 'Postal code',
    showProvince: true,
    postalPlaceholder: '',
  },
}

const COUNTRIES = Object.keys(COUNTRY_CONFIGS)

interface Props {
  label?: string
}

export function AddressFormModal({ label = 'Add address' }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [country, setCountry] = useState('Philippines')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const config = COUNTRY_CONFIGS[country] ?? COUNTRY_CONFIGS['Other']

  function reset() {
    setCountry('Philippines'); setLine1(''); setLine2('')
    setCity(''); setProvince(''); setPostalCode('')
    setIsDefault(false); setError('')
  }

  function close() { reset(); setOpen(false) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in.'); setSaving(false); return }

    // If setting as default, unset all others first
    if (isDefault) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    }

    const { error: insertError } = await supabase.from('addresses').insert({
      user_id: user.id,
      line1,
      line2: line2 || null,
      city,
      province: config.showProvince ? province : city,
      country,
      postal_code: postalCode,
      is_default: isDefault,
    })

    if (insertError) {
      setError('Failed to save address. Please try again.')
      setSaving(false)
      return
    }

    setSaving(false)
    close()
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brown text-sm text-brown hover:bg-brown hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={close} />

          {/* Modal */}
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-peach-light">
              <h2 className="text-base font-medium text-brown">Add address</h2>
              <button onClick={close} className="text-brown-light hover:text-brown p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Country selector — first so form adapts below it */}
              <div>
                <label className="block text-sm text-brown mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={e => { setCountry(e.target.value); setProvince(''); setPostalCode('') }}
                  className="w-full px-4 py-2.5 rounded-lg border border-peach-light bg-white text-sm text-brown focus:outline-none focus:ring-2 focus:ring-peach"
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <Input
                label="Address line 1"
                placeholder="House / unit no., street name"
                value={line1}
                onChange={e => setLine1(e.target.value)}
                required
              />

              <Input
                label="Address line 2 (optional)"
                placeholder="Barangay, subdivision, building"
                value={line2}
                onChange={e => setLine2(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  placeholder="City / Municipality"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                />
                {config.showProvince && (
                  <Input
                    label={config.provinceLabel}
                    placeholder={config.provinceLabel}
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    required={config.showProvince}
                  />
                )}
              </div>

              <Input
                label={config.postalLabel}
                placeholder={config.postalPlaceholder}
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                pattern={config.postalPattern}
                required
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setIsDefault(prev => !prev)}
                  className={`w-10 h-6 rounded-full transition-colors shrink-0 ${isDefault ? 'bg-brown' : 'bg-[#E0D5CC]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${isDefault ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-brown">Set as default address</span>
              </label>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brown text-white hover:bg-brown-light py-3 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save address'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
                  className="border-brown text-brown px-6 py-3 rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}