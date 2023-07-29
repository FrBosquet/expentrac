'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { RxCross2 } from "react-icons/rx"

export const Close = Dialog.Close

type Props = {
  trigger: React.ReactNode
  children: React.ReactNode
  title: string
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Modal = ({ trigger, children, title, description, open, onOpenChange }: Props) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Trigger asChild>
      {trigger}
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-gray-700/70" />
      <Dialog.Content className="bg-white fixed shadow-md p-4 rounded-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64">
        <Dialog.Title asChild >
          <div className="flex justify-between text-2xl font-semibold uppercase pb-4">
            <h2 className='tracking-tighter'>{title}</h2>
            <Dialog.Close asChild>
              <button><RxCross2 /></button>
            </Dialog.Close>
          </div>
        </Dialog.Title>
        <Dialog.Description className="DialogDescription">
          {description}
        </Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)