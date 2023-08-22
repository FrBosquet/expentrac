import { type Dispatch, type SetStateAction, useState } from 'react'

interface ResourceContext<T> {
  resource: T[]
  setResource: Dispatch<SetStateAction<T[]>>
  add: (resource: T) => void
  remove: (resource: T) => void
  update: (resource: T) => void
}

export const useResourceContext = <T extends { id: string }>
  (
    initialValue: T[],
    sortFunction: (a: T, b: T) => number
  ): ResourceContext<T> => {
  const [resource, setResource] = useState(initialValue)

  const add = (resource: T) => {
    setResource((resources) => [...resources, resource].sort(sortFunction))
  }

  const remove = (resource: T) => {
    setResource((resources) => resources.filter((r) => r.id !== resource.id))
  }

  const update = (resource: T) => {
    setResource((resources) => resources
      .map((r) => r.id === resource.id ? resource : r)
      .sort(sortFunction)
    )
  }

  return { resource, setResource, add, remove, update }
}
