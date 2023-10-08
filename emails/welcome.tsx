import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
import TemplateEmail from './template'

export interface WelcomeEmailProps {
  username: string
}

export default function WelcomeEmail({
  username = 'Fran Bosquet'
}: WelcomeEmailProps) {
  return (
    <TemplateEmail preview={`Welcome to Expentrac, ${username}`}>
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Welcome {username}
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        This is <strong>Fran</strong>, from <strong>Expentrac</strong>
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        Thank you very much for giving us a try! We are very excited to onboard new users like you. Im working hard to make <strong>Expentrac</strong> the best expense tracker possible. I hope you enjoy it!
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        You can start by jumping straight to your dashboard and start adding your expenses. If you have any questions, please feel free to reach <a href="https:x.com/frbosquet" target='_blank' rel="noreferrer">out to me at X</a>.
      </Text>
      <Section className="mt-[24px] mb-[24px] flex justify-center">
        <Button
          pX={20}
          pY={12}
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center mr-[12px]"
          href='https://www.expentrac.app/dashboard/loans'
        >
          Add a loan
        </Button>
        <Button
          pX={20}
          pY={12}
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
          href='https://www.expentrac.app/dashboard/subscriptions'
        >
          Add a subscription
        </Button>
      </Section>
    </TemplateEmail>
  )
}
