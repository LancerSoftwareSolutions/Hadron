'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({
  children,
  pending,
  className = 'btn btn-primary',
}: {
  children: React.ReactNode
  pending?: string
  className?: string
}) {
  const { pending: isPending } = useFormStatus()
  return (
    <button type="submit" disabled={isPending} className={className}>
      {isPending && pending ? pending : children}
    </button>
  )
}
