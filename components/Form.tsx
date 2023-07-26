import * as Form from '@radix-ui/react-form';
import { FormEventHandler } from 'react';

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
}

export const TextField = ({ name }: FieldProps) => {
  return <Form.Field className="FormField" name={name}>
    <div>
      <Form.Label className="FormLabel">{name}</Form.Label>
    </div>
    <Form.Control asChild>
      <input className="Input" type="text" required />
    </Form.Control>
  </Form.Field>
};

export const NumberField = ({ name }: FieldProps) => {
  return <Form.Field className="FormField" name={name}>
    <div>
      <Form.Label className="FormLabel">{name}</Form.Label>
    </div>
    <Form.Control asChild>
      <input className="Input" type="number" required />
    </Form.Control>
  </Form.Field>
};

type SubmitProps = {
  children: React.ReactNode
}

export const SubmitButton = ({ children }: SubmitProps) => {
  return <Form.Submit asChild>
    <button className="Button" style={{ marginTop: 10 }}>
      {children}
    </button>
  </Form.Submit>
}