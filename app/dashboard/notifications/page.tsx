import { NotificationList } from '@components/notifications/NotificationList'

export default function page() {
  return (
    <>
      <h1 className="col-span-2 pb-8 text-4xl font-semibold lg:col-span-4">
        Notifications
      </h1>
      <NotificationList className="col-span-2 lg:col-span-4" />
    </>
  )
}
