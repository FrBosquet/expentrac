import { useUser } from '@components/Provider'
import { Separator } from '@components/ui/separator'
import { euroFormatter } from '@lib/currency'
import { type User } from '@lib/prisma'
import { twMerge } from 'tailwind-merge'

interface Props {
  asset: {
    shares: Array<{
      id: string
      user: User
      accepted: boolean | null
    }>
    fee: number
    user: User
  }
  assetType: string
}

export const SharesDetail = ({ asset: { shares, fee, user: loanUser }, assetType }: Props) => {
  const { user: currentUser } = useUser()

  const parts = shares.filter(share => share.accepted === true).length + 1
  const chargeByPart = fee / parts
  const inEuros = `${euroFormatter.format(chargeByPart)}/m`

  const userOwnThis = currentUser.id === loanUser.id

  return <>
    <Separator className="col-span-2" />
    <section className='col-span-2 flex flex-col gap-2'>

      <p className="text-sm">This {assetType} fee is shared by:</p>
      <article className="flex items-center gap-2">
        <p className={twMerge('text-sm font-semibold', userOwnThis && 'flex-1')}>{userOwnThis ? 'You' : `${loanUser.name} (owner)`}</p>
        {
          userOwnThis
            ? null
            : <p className="text-sm text-slate-500 flex-1">{loanUser.email}</p>
        }
        <p className="text-xs">{inEuros}</p>
      </article>
      {
        shares.map((share) => {
          const { user, accepted } = share

          const isCurrentUser = currentUser.id === user.id

          return <article key={share.id} className="flex items-center gap-2">
            <p className={twMerge('text-sm font-semibold', isCurrentUser && 'flex-1')}>{isCurrentUser ? 'You' : user.name}</p>
            {!isCurrentUser ? <p className="text-sm text-slate-500 flex-1">{user.email}{ }</p> : null}
            {
              accepted === true
                ? <p className='text-xs'>{inEuros}</p>
                : null
            }
            {
              accepted === false
                ? <p className='text-xs'>Rejected</p>
                : null
            }
            {
              accepted === null
                ? <p className='text-xs'>Pending</p>
                : null
            }
          </article>
        })
      }
    </section>
  </>
}
