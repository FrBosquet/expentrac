'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useQueryScope } from '@store'
import { keys } from '@lib/query-policy'
import { getUsersByEmail } from '@sdk/user'
import { searchBrands } from '@sdk/brands'

function useSearchTerm(value: string) {
  const normalized = value.trim().toLowerCase()
  const [term, setTerm] = useState(normalized)
  useEffect(() => {
    const timer = setTimeout(() => setTerm(normalized), 250)
    return () => clearTimeout(timer)
  }, [normalized])
  return { term, waiting: term !== normalized }
}

function useSearchCancellation(
  resource: string,
  term: string,
  enabled: boolean
) {
  const id = useQueryScope()
  const client = useQueryClient()
  useEffect(() => {
    if (!enabled)
      void client.cancelQueries({
        queryKey: keys.search(id, resource, term),
        exact: true
      })
  }, [client, id, resource, term, enabled])
}

export function useUserSearch(value: string, open: boolean) {
  const id = useQueryScope()
  const { term, waiting } = useSearchTerm(value)
  const enabled =
    !!id && open && !waiting && term.length >= 3 && term.length <= 254
  const query = useQuery({
    queryKey: keys.search(id, 'users', term),
    queryFn: ({ signal }) => getUsersByEmail(term, signal),
    enabled,
    staleTime: 30_000,
    gcTime: 60_000
  })
  useSearchCancellation('users', term, enabled)
  return {
    query,
    results: enabled ? (query.data ?? []) : [],
    searching: open && value.trim().length >= 3 && (waiting || query.isLoading),
    enabled
  }
}

export function useBrandSearch(value: string, active: boolean) {
  const id = useQueryScope()
  const { term, waiting } = useSearchTerm(value)
  const enabled = !!id && active && !waiting && term.length >= 2
  const query = useQuery({
    queryKey: keys.search(id, 'brands', term),
    queryFn: ({ signal }) => searchBrands(term, signal),
    enabled,
    staleTime: 60_000,
    gcTime: 60_000
  })
  useSearchCancellation('brands', term, enabled)
  return {
    query,
    results: enabled ? (query.data ?? []) : [],
    searching:
      active && value.trim().length >= 2 && (waiting || query.isLoading),
    enabled
  }
}
