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
    const result = await operation()
    return result instanceof Response ? result : NextResponse.json(result)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    if (error && typeof error === 'object' && 'code' in error) {
      const status =
        error.code === 'P2002' || error.code === 'P2034'
          ? 409
          : error.code === 'P2025'
            ? 404
            : error.code === 'P2003'
              ? 400
              : 500
      return NextResponse.json(
        {
          message:
            status === 409
              ? 'Conflicting change; refresh and retry'
              : 'Unable to complete request'
        },
        { status }
      )
    }
    return NextResponse.json(
      { message: 'Unable to complete request' },
      { status: 500 }
    )
  }
}
