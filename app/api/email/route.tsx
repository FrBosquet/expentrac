import { NextResponse } from 'next/server'

import WelcomeEmail from '@emails/welcome'

import { prisma } from '@services/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY)

// const sendFunction = async function () {
//   try {
//     const Template = templates.test

//     const data = await resend.emails.send({
//       from: 'Fran from Expentrac <info@expentrac.app>',
//       to: ['frbosquet@gmail.com'],
//       subject: 'Welcome to expentrac',
//       react: <Template />
//     })

//     console.log(data)
//   } catch (error) {
//     console.error(error)
//   }
// }

const templates = {
  welcome: WelcomeEmail
}

type Template = keyof typeof templates

const sendEmail = async (userId: string, template: Template) => {
  const Component = templates[template]

  if (!Component) {
    throw new Error('Template not found')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const data = await resend.emails.send({
    from: 'Fran from Expentrac <info@expentrac.app>',
    to: [user?.email as string],
    subject: 'Welcome to expentrac',
    react: <Component username={user.name as string} />
  })

  return data
}

export const POST = async (req: Request) => {
  // await sendFunction()

  const body = await req.json()

  const { userId, template } = body as { userId: string, template: string }

  await sendEmail(userId, template as Template)

  console.log(userId, template)

  return NextResponse.json('ok')
}
