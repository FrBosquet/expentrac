import { Avatar } from '@components/avatar'
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
    shares: { data: shares },
    user: contractUser,
    fee: { holderMonthly }
  } = contract

  const inEuros = `${euroFormatter.format(holderMonthly)}/m`

  const userOwnThis = currentUser.id === contractUser.id

  const assetType = contract.type === 'LOAN' ? 'loan' : 'subscription'

  return (
    <>
      <Separator className="col-span-2" />
      <section className="col-span-2 flex flex-col gap-2">
        <p className="text-sm">This {assetType} fee is shared by:</p>
        <article className="flex items-center gap-2">
          <Avatar
            className={'size-6'}
            user={userOwnThis ? currentUser : contractUser}
          />
          <p
            className={twMerge(
              'text-sm font-semibold whitespace-nowrap',
              userOwnThis && 'flex-1'
            )}
          >
            {userOwnThis ? 'You' : `${contractUser.name} (owner)`}
          </p>
          {userOwnThis ? null : (
            <p className="flex-1 overflow-hidden text-ellipsis text-sm text-slate-500">
              {contractUser.email}
            </p>
          )}
          <p className="text-xs">{inEuros}</p>
        </article>
        {shares.map((share) => {
          const { accepted, toId, to } = share

          const isCurrentUser = currentUser.id === toId

          return (
            <article key={share.id} className="flex items-center gap-2">
              <Avatar className={'size-6'} user={to} />
              <p
                className={twMerge(
                  'text-sm font-semibold',
                  isCurrentUser && 'flex-1'
                )}
              >
                {isCurrentUser ? 'You' : to.name}
              </p>
              {!isCurrentUser ? (
                <p className="flex-1 text-sm text-slate-500">
                  {to.email}
                  {}
                </p>
              ) : null}
              {accepted === true ? <p className="text-xs">{inEuros}</p> : null}
              {accepted === false ? <p className="text-xs">Rejected</p> : null}
              {accepted === null ? <p className="text-xs">Pending</p> : null}
            </article>
          )
        })}
      </section>
    </>
  )
}
