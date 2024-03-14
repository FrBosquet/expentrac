import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
import TemplateEmail from './template'

export interface SubShareProps {
  username: string
  sharer: string
  subAmount: number
  subName: string
}

export default function SubShareEmail({
  username = 'Fran Bosquet',
  sharer = 'Other User',
  subName = 'Netflix',
  subAmount = 30
}: SubShareProps) {
  return (
    <TemplateEmail preview={`${sharer} wants to share a subscription with you`}>
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Hey {username}
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        {sharer} wants to share a subscription with you. The subscription in question is:
      </Text>
      <Text className="text-black text-[20px] leading-[24px] text-center">
        <strong>{subName}</strong>
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        Monthly fee for this subscription is <strong>{new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'EUR' }).format(subAmount)}</strong>. You can accept or reject it in your notifications section.
      </Text>
      <Section className="mt-[24px] mb-[24px] flex justify-center">
        <Button
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center p-3 shadow-md"
          href='https://www.expentrac.app/dashboard/notifications'
        >
          Your notifications centre
        </Button>
      </Section>
    </TemplateEmail>
  )
}
