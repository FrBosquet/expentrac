import { CheckCircle, User } from 'lucide-react'
import { Tooltip } from './Tooltip'

export const PaidIcon = () => {
  return <Tooltip side="bottom" tooltip={'This fee is already paid this month'}>
    <CheckCircle size={14} className="text-expentrac-800" />
  </Tooltip>
}

export const ShareIcon = ({ shared }: { shared: boolean }) => {
  return <Tooltip side="bottom" tooltip={shared
    ? 'This fee is shared'
    : 'Share invitations are sent, but not yet accepted'
  }>
    <User size={14} />
  </Tooltip>
}
