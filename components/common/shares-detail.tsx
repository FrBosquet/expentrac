import { Separator } from '@components/ui/separator'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import { type Loan } from '@lib/loan'
import { type Subscription } from '@lib/sub'
import { twMerge } from 'tailwind-merge'

interface Props {
  contract: Loan | Subscription
}

export const SharesDetail = ({ contract }: Props) => {
  const { user: currentUser } = useUser()

  const {
    shares: {
      data: shares
    },
    user: contractUser,
    fee: {
      holder
    }
  } = contract

  const inEuros = `${euroFormatter.format(holder)}/m`

  const userOwnThis = currentUser.id === contractUser.id

  const assetType = contract.type === 'LOAN' ? 'loan' : 'subscription'

  return <>
    <Separator className="col-span-2" />
    <section className='col-span-2 flex flex-col gap-2'>

      <p className="text-sm">This {assetType} fee is shared by:</p>
      <article className="flex items-center gap-2">
        <p className={twMerge('text-sm font-semibold', userOwnThis && 'flex-1')}>{userOwnThis ? 'You' : `${contractUser.name} (owner)`}</p>
        {
          userOwnThis
            ? null
            : <p className="text-sm text-slate-500 flex-1">{contractUser.email}</p>
        }
        <p className="text-xs">{inEuros}</p>
      </article>
      {
        shares.map((share) => {
          const { accepted, contract: { user } } = share

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
