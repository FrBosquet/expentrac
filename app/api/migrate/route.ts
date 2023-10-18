/* eslint-disable @typescript-eslint/indent */
import { prisma } from '@lib/prisma'
import { CONTRACT_TYPE } from '@sdk/contract'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const loans = await prisma.loan.findMany({
    include: {
      user: true,
      lender: {
        include: {
          provider: true
        }
      },
      platform: {
        include: {
          provider: true
        }
      },
      vendor: {
        include: {
          provider: true
        }
      },
      shares: true
    }
  })

  console.log(`found ${loans.length} loans`)
  const contracts = await Promise.all(
    loans.map(async (loan) => {
      const { user, lender, platform, vendor, shares, fee, initial, startDate, endDate, createdAt, updatedAt, id, name, link } = loan

      const newContract = await prisma.contract.create({
        data: {
          user: {
            connect: {
              id: user.id
            }
          },
          createdAt,
          updatedAt,
          id,
          name,
          fee: initial,
          type: CONTRACT_TYPE.LOAN,
          providers: {
            createMany: {
              data: [
                {
                  createdAt,
                  updatedAt,
                  as: 'LENDER',
                  providerId: lender?.provider.id ?? 'REMOVE'
                },
                {
                  createdAt,
                  updatedAt,
                  as: 'PLATFORM',
                  providerId: platform?.provider.id ?? 'REMOVE'
                },
                {
                  createdAt,
                  updatedAt,
                  as: 'VENDOR',
                  providerId: vendor?.provider.id ?? 'REMOVE'
                }
              ].filter(({ providerId }) => providerId !== 'REMOVE')
            }
          },
          shares: {
            createMany: {
              data: shares.map((share) => ({
                createdAt,
                updatedAt,
                fromId: user.id,
                toId: share.userId
              }))
            }
          },
          periods: {
            create: {
              createdAt,
              updatedAt,
              from: startDate,
              to: endDate,
              fee
            }
          },
          resources: link
            ? {
              create: {
                createdAt,
                updatedAt,
                name: 'link',
                type: 'LINK',
                url: link
              }
            }
            : undefined
        },
        include: {
          providers: true,
          shares: true,
          periods: true,
          resources: true
        }
      })

      return newContract
    })
  )

  const subs = await prisma.subscription.findMany({
    include: {
      user: true,
      platform: {
        include: {
          provider: true
        }
      },
      vendor: {
        include: {
          provider: true
        }
      },
      shares: true
    }
  })

  console.log(`found ${subs.length} subs`)
  const subContracts = await Promise.all(subs.map(async (sub) => {
    const { user, platform, vendor, shares, fee, yearly, payday, createdAt, updatedAt, id, name, link } = sub

    const newContract = await prisma.contract.create({
      data: {
        user: {
          connect: {
            id: user.id
          }
        },
        createdAt,
        updatedAt,
        id,
        name,
        fee,
        type: CONTRACT_TYPE.SUBSCRIPTION,
        providers: {
          createMany: {
            data: [
              {
                createdAt,
                updatedAt,
                as: 'PLATFORM',
                providerId: platform?.provider.id ?? 'REMOVE'
              },
              {
                createdAt,
                updatedAt,
                as: 'VENDOR',
                providerId: vendor?.provider.id ?? 'REMOVE'
              }
            ].filter(({ providerId }) => providerId !== 'REMOVE')
          }
        },
        shares: {
          createMany: {
            data: shares.map((share) => ({
              createdAt,
              updatedAt,
              fromId: user.id,
              toId: share.userId
            }))
          }
        },
        periods: {
          create: {
            createdAt,
            updatedAt,
            from: createdAt,
            periodicity: yearly ? 'YEARLY' : 'MONTHLY',
            payday,
            fee
          }
        },
        resources: link
          ? {
            create: {
              createdAt,
              updatedAt,
              name: 'link',
              type: 'LINK',
              url: link
            }
          }
          : undefined
      },
      include: {
        providers: true,
        shares: true,
        periods: true,
        resources: true
      }
    })

    return newContract
  }))

  return NextResponse.json({ contracts, subContracts }, { status: 200 })
}
