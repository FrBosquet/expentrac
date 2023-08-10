import { authOptions } from "@services/auth"
import { prisma } from "@services/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  const providers = await prisma.userProvider.findMany({
    where: { userId },
    include: {
      provider: true
    }
  })

  return NextResponse.json(providers)
}

const parseBody = <T>(body: Record<string, string>) => {
  return Object.entries(body).reduce((acc, [key, value]) => {
    let parsedValue: any = value

    return {
      ...acc,
      [key]: parsedValue
    }
  }, {}) as T
}

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({
      message: 'unauthorized'
    }, {
      status: 400
    })
  }

  const userId = session.user.id

  const body = await req.json()

  const parsedBody = parseBody<{ name: string, providerId?: string }>(body)

  const newLoan = await prisma.userProvider.create({
    data: {
      provider: {
        connectOrCreate: {
          where: {
            name: parsedBody.name
          },
          create: {
            name: parsedBody.name
          }
        },
      },
      user: {
        connect: {
          id: userId
        }
      }
    },
    include: {
      provider: true
    }
  })

  return NextResponse.json({ message: 'success', data: newLoan }, { status: 201 })
}

// export const PATCH = async (req: Request) => {
//   const session = await getServerSession(authOptions)

//   if (!session) {
//     return NextResponse.json({
//       message: 'userId is required'
//     }, {
//       status: 400
//     })
//   }

//   const userId = session.user.id

//   const body = await req.json()
//   const loan = await prisma.userProvider.findUnique({ where: { id: body.id } })

//   if (!loan) {
//     return NextResponse.json({
//       message: 'loan not found'
//     }, {
//       status: 404
//     })
//   }

//   if (userId !== loan?.userId) {
//     return NextResponse.json({
//       message: 'user does not own this resource'
//     }, {
//       status: 403
//     })
//   }

//   const updatedLoan = await prisma.userProvider.update({
//     data: parseBody<UserProvider>(body),
//     where: {
//       id: body.id
//     }
//   })

//   return NextResponse.json({ message: 'success', data: updatedLoan }, { status: 200 })
// }

// export const DELETE = async (req: Request) => {
//   const session = await getServerSession(authOptions)

//   if (!session) {
//     return NextResponse.json({
//       message: 'forbidden'
//     }, {
//       status: 403
//     })
//   }

//   const { searchParams } = new URL(req.url)
//   const id = searchParams.get('id')

//   if (!id) {
//     return NextResponse.json({
//       message: 'id is required'
//     }, {
//       status: 400
//     })
//   }

//   const loan = await prisma.userProvider.findUnique({ where: { id } })

//   if (!loan) {
//     return NextResponse.json({
//       message: 'loan not found'
//     }, {
//       status: 404
//     })
//   }

//   if (session.user.id !== loan?.userId) {
//     return NextResponse.json({
//       message: 'user does not own this resource'
//     }, {
//       status: 403
//     })
//   }

//   await prisma.userProvider.delete({ where: { id } })

//   return NextResponse.json({ message: 'DELETED' }, { status: 200 })
// }