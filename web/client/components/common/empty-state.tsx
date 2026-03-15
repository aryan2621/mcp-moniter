import type { LucideIcon } from 'lucide-react'
import { NoDataFound } from './no-data-found'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <NoDataFound
      icon={icon}
      title={title}
      description={description}
      action={action}
      variant="standalone"
    />
  )
}
