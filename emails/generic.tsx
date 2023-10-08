import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
import TemplateEmail from './template'

export interface GenericEmailProps {
  username: string
  message: string
}

export default function GenericEmail({
  username = 'Fran Bosquet',
  message = 'lore ipsum dolor sit amet'
}: GenericEmailProps) {
  return (
    <TemplateEmail preview={`An email from Expentrac, ${username}`}>
      <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
        Hi {username}
      </Heading>
      <Text className="text-black text-[14px] leading-[24px]">
        This is <strong>Fran</strong>, from <strong>Expentrac</strong>
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        {message}
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
