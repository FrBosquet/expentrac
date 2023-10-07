import { type Loan, type Subscription } from '@prisma/client'
import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
import TemplateEmail from './template'

export interface DailyEmailProps {
  username: string
  loans: Loan[]
  subscriptions: Subscription[]
}

export default function DailyEmail({
  username = 'Fran Bosquet',
  loans = [
    {
      name: 'Loan 1',
      fee: 1000
    } as unknown as Loan
  ],
  subscriptions = [{
    name: 'Subscription 1',
    fee: 100
  } as unknown as Subscription
  ]
}: DailyEmailProps) {
  return (
    <TemplateEmail preview={'Your payments for today'}>
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Hi {username}
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        This is <strong>Fran</strong>, from <strong>Expentrac</strong>, given your daily update about your expenses. Today, you are paying for:
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        <ul className="list-disc list-inside">
          {loans.map((loan, index) => (
            <li key={index}><strong>{loan.name}</strong> - {loan.fee}€</li>
          ))}
          {subscriptions.map((subscription, index) => (
            <li key={index}><strong>{subscription.name}</strong> - {subscription.fee}€</li>
          ))}
        </ul>
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        Access you dashboard to see more details about your expenses.
      </Text>
      <Section className="mt-[24px] mb-[24px] flex justify-center">
        <Button
          pX={20}
          pY={12}
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center mr-[12px]"
          href='https://www.expentrac.app/dashboard'
        >
          Your dashboard
        </Button>
      </Section>
    </TemplateEmail>
  )
}
