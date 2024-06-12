import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger
} from './ui/tooltip'

interface Props {
  children: React.ReactNode
  tooltip: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip = ({ children, tooltip, side }: Props) => {
  const tooltipContent =
    typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip

  return (
    <ShadcnTooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={side}>{tooltipContent}</TooltipContent>
    </ShadcnTooltip>
  )
}
