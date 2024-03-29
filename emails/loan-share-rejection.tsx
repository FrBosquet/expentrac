import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
import TemplateEmail from './template'

export interface LoanShareAcceptProps {
  username: string
  shareHolder: string
  loanName: string
}

export default function LoanShareAcceptEmail({
  username = 'Fran Bosquet',
  shareHolder = 'Cris Tena',
  loanName = 'Netflix'
}: LoanShareAcceptProps) {
  return (
    <TemplateEmail preview={`${shareHolder} refused to share a loan with you`}>
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Hey {username}
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        We are sorry! <strong>{shareHolder}</strong> refused to share the <strong>{loanName}</strong> fee with you. You can add more share holders or manage your loan in the loans section.
      </Text>
      <Section className="mt-[24px] mb-[24px] flex justify-center">
        <Button
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center p-3 shadow-md"
          href='https://www.expentrac.app/dashboard/loans'
        >
          Your loans
        </Button>
      </Section>
    </TemplateEmail>
  )
}
