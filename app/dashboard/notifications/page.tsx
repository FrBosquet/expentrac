import { NotificationList } from '@components/notifications/NotificationList'

export default function page() {
  return <>
    <h1 className='text-4xl font-semibold col-span-2 lg:col-span-4'>Notifications</h1>
    <NotificationList className='col-span-2 lg:col-span-4' />
  </>
}
