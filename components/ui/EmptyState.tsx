interface Props { message: string; action?: React.ReactNode }

export function EmptyState({ message, action }: Props) {
  return (
    <div className="py-16 text-center">
      <p className="text-brown-light text-sm mb-4">{message}</p>
      {action}
    </div>
  )
}
