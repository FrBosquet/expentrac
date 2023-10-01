import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
import TemplateEmail from './template'

export interface SubShareAcceptProps {
  username: string
  shareHolder: string
  subName: string
}

export default function SubShareAcceptEmail({
  username = 'Fran Bosquet',
  shareHolder = 'Cris Tena',
  subName = 'Netflix'
}: SubShareAcceptProps) {
  return (
    <TemplateEmail username={username} preview={`${shareHolder} accepted to share a subscription with you`}>
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Hey {username}
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        Congrats! <strong>{shareHolder}</strong> accepted to share the <strong>{subName}</strong> fee with you. You can add more share holders or manage your subscription in the subscriptions section.
      </Text>
      <Section className="mt-[24px] mb-[24px] flex justify-center">
        <Button
          pX={20}
          pY={12}
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          href='https://www.expentrac.app/dashboard/subscriptions'
        >
          Your subscriptions
        </Button>
      </Section>
    </TemplateEmail>
  )
}
