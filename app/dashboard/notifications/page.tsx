import { NotificationList } from '@components/notifications/NotificationList'

export default function page() {
  return <section className="flex-1 w-screen max-w-3xl p-12 mx-auto">
    <h1 className='text-4xl font-semibold'>Notifications</h1>
    <NotificationList />
  </section>
}
