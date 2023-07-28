import { prisma } from "@services/prisma";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  const loans = await prisma.loan.findMany({ where: { userId } });

  return NextResponse.json(loans)
}

export const POST = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({
      message: 'userId is required'
    }, {
      status: 400
    })
  }

  const body = await req.json();

  const newLoan = await prisma.loan.create({
    data: {
      ...body,
      fee: Number(body.fee),
      startDate: new Date(body.startDate).toISOString(),
      endDate: new Date(body.endDate).toISOString(),
      user: {
        connect: {
          id: userId
        }
      }
    }
  })

  return NextResponse.json({ message: 'POST', data: newLoan }, { status: 201 })
}
