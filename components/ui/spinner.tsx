import { cn } from '@lib/utils'
import { Loader2, type LucideProps } from 'lucide-react'

export const Spinner = ({ className, ...props }: LucideProps) => {
  return <Loader2 className={cn('animate animate-spin', className)} {...props} />
}
