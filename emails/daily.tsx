import { Button, Heading, Section, Text } from 'react-email'
import { sumMoney } from '@lib/money'
import { euroFormatter } from '@lib/currency'
import { unwrapLoan } from '@lib/loan'
import { type Contract } from '@lib/models'
import { unwrapSub } from '@lib/sub'
import TemplateEmail from './template'

export interface DailyEmailProps {
  username: string
  loans: Contract[]
  subs?: Contract[]
  /** Dynamic subject/preview e.g. "12,50 € today: Vercel, Apple" — set by sendDailyEmail */
  preview?: string
}

export default function DailyEmail({
  username = 'Fran Bosquet',
  loans = [],
  subs = [],
  preview
}: DailyEmailProps) {
  const loansData = loans?.map((loan) => unwrapLoan(loan))
  const subData = subs?.map((subscription) => unwrapSub(subscription))

  const previewText =
    preview ??
    (() => {
      if (!loansData?.length && !subData?.length)
        return 'Your payments for today'
      const total = sumMoney(
        ...loansData.map((loan) => loan.fee.holder),
        ...subData.map((sub) => sub.fee.holder)
      )
      const names = [
        ...(loansData?.map((l) => l.name) ?? []),
        ...(subData?.map((s) => s.name) ?? [])
      ]
      return `${euroFormatter.format(total)} today: ${names.join(', ')}`
    })()

  return (
    <TemplateEmail preview={previewText}>
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Hi {username}
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        This is <strong>Fran</strong>, from <strong>Expentrac</strong>, given
        your daily update about your expenses. Today, you are paying for:
      </Text>
      <Section className="text-black text-[14px] leading-[24px]">
        <ul className="list-disc list-inside">
          {loansData?.map((loan, index) => (
            <li key={index}>
              <strong>{loan.name}</strong> -{' '}
              {euroFormatter.format(loan.fee.holder)}
            </li>
          ))}
          {subData?.map((sub, index) => (
            <li key={index}>
              <strong>{sub.name}</strong> -{' '}
              {euroFormatter.format(sub.fee.holder)}
            </li>
          ))}
        </ul>
      </Section>
      <Text className="text-black text-[14px] leading-[24px]">
        Access your dashboard to see more details about your expenses.
      </Text>
      <Section className="mt-[24px] mb-[24px] flex justify-center">
        <Button
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center mr-[12px] p-3 "
          href="https://www.expentrac.app/dashboard"
        >
          Your dashboard
        </Button>
      </Section>
    </TemplateEmail>
  )
}
