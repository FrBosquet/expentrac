'use client'
import { QueryState } from '@components/dashboard/query-state'
import { PageSkeleton } from '@components/dashboard/skeletons'
import { Input } from '@components/ui/input'
import { useProfile, useProfileWrite } from '@hooks/resources'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { type FormEvent } from 'react'
export default function Page() {
  const query = useProfile()

  const mutation = useProfileWrite()
  const { update } = useSession()
  const router = useRouter()
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      await mutation.mutateAsync({
        name: String(data.get('name') ?? ''),
        occupation: String(data.get('occupation') ?? '')
      })
      await update()
      router.push('/dashboard/profile')
    } catch {
      /* Mutation error is displayed; keep the draft intact. */
    }
  }
  const user = query.data

  return (
    <QueryState
      pending={query.isPending}
      error={query.error}
      hasData={query.data !== undefined}
      fetching={query.isFetching}
      retry={() => {
        void query.refetch()
      }}
      skeleton={<PageSkeleton kind="form" />}
    >
      <form className="col-span-4 flex gap-8" onSubmit={handleSubmit}>
        <fieldset className="flex flex-1 flex-col justify-center gap-2">
          <label className="text-xs uppercase text-theme-light" htmlFor="name">
            Name
          </label>
          <Input
            className="p-2 text-lg"
            defaultValue={user?.name ?? ''}
            id="name"
            name="name"
            type="text"
          />

          <label
            className="text-xs uppercase text-theme-light"
            htmlFor="occupation"
          >
            Occupation
          </label>
          <Input
            defaultValue={user?.occupation ?? ''}
            id="occupation"
            name="occupation"
            type="text"
          />

          <label className="text-xs uppercase text-theme-light" htmlFor="email">
            Email
          </label>
          <Input
            disabled
            defaultValue={user?.email ?? ''}
            id="email"
            name="email"
            type="text"
          />
        </fieldset>
        <button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
        {mutation.isError && <p role="alert">{mutation.error.message}</p>}
      </form>
    </QueryState>
  )
}
