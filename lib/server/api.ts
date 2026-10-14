import { authOptions } from '@lib/auth'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export async function requireUser(req?: Request) {
  const session = await getServerSession(authOptions)
  const id = session?.user?.id
  if (!id) throw new ApiError(401, 'Authentication required')
  const requestedId = req && new URL(req.url).searchParams.get('userId')
  if (requestedId && requestedId !== id) throw new ApiError(403, 'Forbidden')
  return id
}

export async function apiResponse(operation: () => Promise<unknown>) {
  try {
    return NextResponse.json(await operation())
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { message: 'Unable to complete request' },
      { status: 500 }
    )
  }
}
