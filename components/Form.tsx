import * as Form from '@radix-ui/react-form'
import { Loader2 } from 'lucide-react'
import { FormEventHandler } from 'react'
import { Button } from './ui/button'
import { Input, InputProps } from './ui/input'
import { Label } from './ui/label'

type Props = {
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

export const FormField = ({ label, name, ...props }: { label: string } & InputProps) => <>
  <Label htmlFor={name} className="text-right">
    {label}
  </Label>
  <Input id={name} name={name} {...props} />
</>

export const SubmitButton = ({ submitting }: { submitting: boolean }) => {
  return <Button variant="ghost" type="submit">
    {submitting ?
      <Loader2 size={16} className="animate animate-spin" />
      : 'Submit'
    }
  </Button>
}