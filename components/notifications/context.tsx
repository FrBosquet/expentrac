'use client'

import { type Notification } from '@lib/prisma'
import { useResourceContext } from '@lib/resourceContext'
import { useStore } from '@store'
import { getPendingNotifications } from '@store/notification'

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react'

interface Props {
  children: ReactNode
  serverValue: Notification[]
}

const defaultContextValue = {
  notifications: [],
  setNotifications: () => null,
  addNotification: () => null,
  removeNotification: () => null,
  updateNotification: () => null,
  hasPending: false,
  pending: 0
}

export const NotificationContext = createContext<{
  notifications: Notification[]
  setNotifications: Dispatch<SetStateAction<Notification[]>>
  addNotification: (provider: Notification) => void
  removeNotification: (provider: Notification) => void
  updateNotification: (provider: Notification) => void
  hasPending: boolean
  pending: number
}>(defaultContextValue)

export const NotificationsProvider = ({ children, serverValue }: Props) => {
  const {
    resource: notifications,
    setResource: setNotifications,
    add: addNotification,
    remove: removeNotification,
    update: updateNotification
  } = useResourceContext<Notification>(serverValue, (a, b) => b.createdAt > a.createdAt ? 1 : -1)

  const pending = notifications.filter((notification) => !notification.ack).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        addNotification,
        removeNotification,
        updateNotification,
        hasPending: pending > 0,
        pending
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const notifications = useStore(state => state.notifications)
  const updateNotification = useStore(state => state.updateNotification)

  const pendingNotifications = useStore(getPendingNotifications)

  return {
    notifications,
    updateNotification,
    hasPending: pendingNotifications.length > 0,
    pending: pendingNotifications.length
  }
}
