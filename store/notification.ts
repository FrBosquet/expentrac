import { type Notification } from '@lib/prisma'
import { type StateCreator } from 'zustand'

export interface NotificationSlice {
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  updateNotification: (notification: Notification) => void
}

const sortFunction = (a: Notification, b: Notification) => {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
}

export const createNotificationSlice: StateCreator<NotificationSlice> = (set) => ({
  notifications: [],
  setNotifications: (rawNotifications: Notification[]) => {
    set({
      notifications: rawNotifications.sort(sortFunction)
    })
  },
  updateNotification: (notification: Notification) => {
    set(state => ({
      notifications: state.notifications.map(l => l.id === notification.id ? notification : l)
    }))
  }
})

export const getPendingNotifications = (state: NotificationSlice) => {
  return state.notifications.filter((n) => !n.ack)
}
