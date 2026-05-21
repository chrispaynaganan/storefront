'use client'
interface Props { checked: boolean; onChange: (v: boolean) => void; label?: string }

export function Toggle({ checked, onChange, label }: Props) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-brown' : 'bg-peach'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-4' : 'left-1'}`} />
      </div>
      {label && <span className="text-sm text-brown">{label}</span>}
    </label>
  )
}
