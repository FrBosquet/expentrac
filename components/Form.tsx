import * as Form from '@radix-ui/react-form'
import { FormEventHandler } from 'react'

type Props = {
  children: React.ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
}

export const Root = ({ children, onSubmit }: Props) => {
  return <Form.Root className="FormRoot" onSubmit={onSubmit}>
    {children}
  </Form.Root>
}

type FieldProps = {
  name: string
  label?: string
  type?: string
}

const FormLabel = ({ label }: Pick<FieldProps, 'label'>) => {
  return <div>
    <Form.Label className="text-xs">{label}</Form.Label>
  </div>
}

const FormInput = ({ name, type }: FieldProps) => {
  return <Form.Control name={name} asChild>
    <input className="w-full border-b border-primary p-2" type={type} required />
  </Form.Control>
}

export const TextField = ({ name, label = name }: FieldProps) => {
  return <Form.Field className="w-full pt-2 pb-6" name={name}>
    <FormLabel label={label} />
    <FormInput name={name} type="text" />
  </Form.Field>
}

export const NumberField = ({ name, label = name }: FieldProps) => {
  return <Form.Field className="FormField" name={name}>
    <FormLabel label={label} />
    <Form.Control name={name} asChild>
      <input className="w-full border-b border-primary p-2" type="number" step="0.01" min="0.1" required />
    </Form.Control>
  </Form.Field>
}

export const DateField = ({ name, label = name }: FieldProps) => {
  return <Form.Field className="FormField" name={name}>
    <FormLabel label={label} />
    <FormInput name={name} type="date" />
  </Form.Field>
}

type SubmitProps = {
  children: React.ReactNode
  className?: string
}

export const SubmitButton = ({ children, className }: SubmitProps) => {
  return <Form.Submit asChild>
    <button className={className}>
      {children}
    </button>
  </Form.Submit>
}