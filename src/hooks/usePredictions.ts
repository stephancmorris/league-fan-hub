'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { useAuth } from './useAuth'

interface Prediction {
  id: string
  predictedWinner: string
  points: number
  isCorrect: boolean | null
  matchId: string
}

interface PredictionsResponse {
  predictions: Prediction[]
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      if (res.status === 401) {
        // User not authenticated, return empty predictions
        return { predictions: [] }
      }
      throw new Error('Failed to fetch predictions')
    }
    return res.json()
  })

/**
 * Custom hook for managing predictions with optimistic updates
 */
export function usePredictions(matchId?: string) {
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Build API URL
  const apiUrl = matchId ? `/api/predictions?matchId=${matchId}` : '/api/predictions'

  // Only fetch if user is authenticated
  const { data, error, isLoading, mutate } = useSWR<PredictionsResponse>(
    isAuthenticated ? apiUrl : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      fallbackData: { predictions: [] }, // Default empty predictions
    }
  )

  /**
   * Submit a prediction with optimistic update
   */
  const submitPrediction = async (matchId: string, predictedWinner: string) => {
    setIsSubmitting(true)

    try {
      // Optimistic update - immediately show prediction in UI
      const optimisticPrediction: Prediction = {
        id: `temp-${Date.now()}`,
        matchId,
        predictedWinner,
        points: 0,
        isCorrect: null,
      }

      // Update cache optimistically
      mutate(
        async (currentData) => {
          // Call API
          const response = await fetch('/api/predictions/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matchId, predictedWinner }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to submit prediction')
          }

          const result = await response.json()

          // Return updated data with new prediction
          return {
            predictions: [
              ...(currentData?.predictions || []),
              {
                ...optimisticPrediction,
                id: result.prediction.id,
              },
            ],
          }
        },
        {
          optimisticData: {
            predictions: [...(data?.predictions || []), optimisticPrediction],
          },
          rollbackOnError: true,
          revalidate: false,
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Get prediction for a specific match
   */
  const getPredictionForMatch = (matchId: string): Prediction | undefined => {
    if (!data?.predictions) return undefined
    return data.predictions.find((p) => p.matchId === matchId)
  }

  return {
    predictions: data?.predictions || [],
    isLoading,
    error,
    isSubmitting,
    submitPrediction,
    getPredictionForMatch,
    refetch: mutate,
  }
}
