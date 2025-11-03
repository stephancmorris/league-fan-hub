'use client'

import useSWR from 'swr'
import { MatchWithPredictions } from '@/types/match'
import { MatchStatus } from '@prisma/client'

interface UseMatchesOptions {
  round?: number
  status?: MatchStatus
  refreshInterval?: number
}

interface MatchesResponse {
  matches: MatchWithPredictions[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/**
 * Hook to fetch matches with automatic revalidation
 * @param options Filtering and refresh options
 */
export function useMatches(options: UseMatchesOptions = {}) {
  const { round, status, refreshInterval = 30000 } = options

  // Build query params
  const params = new URLSearchParams()
  if (round) params.append('round', round.toString())
  if (status) params.append('status', status)

  const url = `/api/matches${params.toString() ? `?${params.toString()}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<MatchesResponse>(url, fetcher, {
    refreshInterval, // Auto-refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    matches: data?.matches || [],
    isLoading,
    isError: error,
    mutate,
  }
}
