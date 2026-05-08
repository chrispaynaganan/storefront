interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, ...props }: Props) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="w-4 h-4 accent-brown" {...props} />
      <span className="text-sm text-brown">{label}</span>
    </label>
  )
}
