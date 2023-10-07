import { Body } from '@react-email/body'
import { Container } from '@react-email/container'
import { Head } from '@react-email/head'
import { Hr } from '@react-email/hr'
import { Html } from '@react-email/html'
import { Img } from '@react-email/img'
import { Preview } from '@react-email/preview'
import { Section } from '@react-email/section'
import { Tailwind } from '@react-email/tailwind'
import { Text } from '@react-email/text'

export interface TemplateProps {
  children: React.ReactNode
  preview: string
}

export default function TemplateEmail({
  children,
  preview = 'Expentrac email'
}: TemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gradient-to-b from-slate-950 to-slate-700 my-auto mx-auto">
          <Container className="bg-slate-200 border border-solid border-slate-100 rounded-lg my-[40px] mx-auto p-[20px] w-[465px] font-sans">
            <Section className="mt-[32px]">
              <Img
                src={'https://expentrac.app/logo.png'}
                width="80"
                height="80"
                alt="Expentrac Logo"
                className="mx-auto"
              />
            </Section>
            {children}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This email was automatically generated by <strong>Expentrac</strong>. If you don&rsquo;t want to receive emails from us, please modify your email preferences in your <a href='https://www.expentrac.app/dashboard/user' target='_blank' rel="noreferrer" >account settings</a>.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
