/**
 * Achievement system for gamification
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  category: 'predictions' | 'accuracy' | 'streak' | 'points'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Prediction milestones
  {
    id: 'first_prediction',
    name: 'Getting Started',
    description: 'Make your first prediction',
    icon: '🎯',
    requirement: 1,
    category: 'predictions',
  },
  {
    id: 'prediction_10',
    name: 'Regular',
    description: 'Make 10 predictions',
    icon: '📊',
    requirement: 10,
    category: 'predictions',
  },
  {
    id: 'prediction_50',
    name: 'Dedicated Fan',
    description: 'Make 50 predictions',
    icon: '🏆',
    requirement: 50,
    category: 'predictions',
  },
  {
    id: 'prediction_100',
    name: 'Century Maker',
    description: 'Make 100 predictions',
    icon: '💯',
    requirement: 100,
    category: 'predictions',
  },

  // Accuracy achievements
  {
    id: 'accuracy_50',
    name: 'On Target',
    description: 'Achieve 50% accuracy (min 10 predictions)',
    icon: '🎪',
    requirement: 50,
    category: 'accuracy',
  },
  {
    id: 'accuracy_70',
    name: 'Sharp Shooter',
    description: 'Achieve 70% accuracy (min 20 predictions)',
    icon: '🎯',
    requirement: 70,
    category: 'accuracy',
  },
  {
    id: 'accuracy_90',
    name: 'Oracle',
    description: 'Achieve 90% accuracy (min 30 predictions)',
    icon: '🔮',
    requirement: 90,
    category: 'accuracy',
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'Hot Streak',
    description: 'Get 3 correct predictions in a row',
    icon: '🔥',
    requirement: 3,
    category: 'streak',
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Get 5 correct predictions in a row',
    icon: '🚀',
    requirement: 5,
    category: 'streak',
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Get 10 correct predictions in a row',
    icon: '⭐',
    requirement: 10,
    category: 'streak',
  },

  // Points achievements
  {
    id: 'points_100',
    name: 'Points Collector',
    description: 'Earn 100 total points',
    icon: '💰',
    requirement: 100,
    category: 'points',
  },
  {
    id: 'points_500',
    name: 'High Scorer',
    description: 'Earn 500 total points',
    icon: '💎',
    requirement: 500,
    category: 'points',
  },
  {
    id: 'points_1000',
    name: 'Legend',
    description: 'Earn 1000 total points',
    icon: '👑',
    requirement: 1000,
    category: 'points',
  },
]

/**
 * Check which achievements a user has earned
 */
export function checkAchievements(stats: {
  totalPredictions: number
  accuracy: number
  currentStreak: number
  totalPoints: number
}): Achievement[] {
  const earned: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    switch (achievement.category) {
      case 'predictions':
        if (stats.totalPredictions >= achievement.requirement) {
          earned.push(achievement)
        }
        break
      case 'accuracy':
        // Require minimum predictions for accuracy badges
        const minPredictions =
          achievement.requirement < 70 ? 10 : achievement.requirement < 90 ? 20 : 30
        if (stats.totalPredictions >= minPredictions && stats.accuracy >= achievement.requirement) {
          earned.push(achievement)
        }
        break
      case 'streak':
        if (stats.currentStreak >= achievement.requirement) {
          earned.push(achievement)
        }
        break
      case 'points':
        if (stats.totalPoints >= achievement.requirement) {
          earned.push(achievement)
        }
        break
    }
  }

  return earned
}

/**
 * Get progress towards next achievement in a category
 */
export function getNextAchievement(
  category: Achievement['category'],
  currentValue: number
): { achievement: Achievement; progress: number } | null {
  const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category).sort(
    (a, b) => a.requirement - b.requirement
  )

  for (const achievement of categoryAchievements) {
    if (currentValue < achievement.requirement) {
      const progress = Math.round((currentValue / achievement.requirement) * 100)
      return { achievement, progress }
    }
  }

  return null
}
