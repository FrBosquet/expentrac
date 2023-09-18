import { NotificationList } from '@components/notifications/NotificationList'

export default function page() {
  return <section className="flex-1 bg-white w-screen max-w-3xl p-12 mx-auto">
    <h1 className='text-6xl font-semibold'>Notifications</h1>
    <NotificationList />
  </section>
}
