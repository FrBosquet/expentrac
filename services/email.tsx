import WelcomeEmail from '@emails/welcome'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY)

const sendWelcome = async (email: string, username: string) => {
  await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: email,
    subject: 'Welcome to Expentrac',
    react: <WelcomeEmail username={username} />
  })
}

export const emailSdk = {
  sendWelcome
}
