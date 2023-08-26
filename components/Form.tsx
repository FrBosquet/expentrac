import * as Form from '@radix-ui/react-form'
import { Loader2 } from 'lucide-react'
import { type FormEventHandler } from 'react'
import { Button } from './ui/button'
import { Input, type InputProps } from './ui/input'
import { Label } from './ui/label'

interface Props {
  children: React.ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
}

export const Root = ({ children, onSubmit }: Props) => {
  return <Form.Root className="FormRoot" onSubmit={onSubmit}>
    {children}
  </Form.Root>
}

export const FieldSet = ({ children, disabled }: { children: React.ReactNode, disabled: boolean }) => {
  return <fieldset disabled={disabled}>
    <div className="grid grid-cols-[auto_1fr] items-center gap-4">
      {children}
    </div>
  </fieldset>
}

export const FormField = ({ label, name, children, ...props }: { label: string, labelClassName?: string } & InputProps) => <>
  <Label htmlFor={name} className='text-right'>
    {label}
  </Label>
  <div className='flex items-center gap-2'>
    <Input id={name} name={name} {...props} />
    {children}
  </div>
</>

export const SubmitButton = ({
  submitting, onClick, children, variant
}: {
  submitting: boolean
  onClick?: () => void
  children?: React.ReactNode
  variant?: 'outline' | 'destructive' | 'link' | 'default' | 'secondary' | 'ghost' | null | undefined
}) => {
  return <Button variant={variant ?? 'ghost'} type={onClick ? 'button' : 'submit'} onClick={onClick}>
    {submitting
      ? <Loader2 size={16} className="animate animate-spin" />
      : children ?? 'Submit'
    }
  </Button>
}
