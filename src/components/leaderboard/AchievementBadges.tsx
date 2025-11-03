'use client'

import {
  Achievement,
  ACHIEVEMENTS,
  checkAchievements,
  getNextAchievement,
} from '@/lib/achievements'

interface AchievementBadgesProps {
  stats: {
    totalPredictions: number
    accuracy: number
    currentStreak: number
    totalPoints: number
  }
}

/**
 * AchievementBadges component
 * Displays earned achievements and progress towards next ones
 */
export function AchievementBadges({ stats }: AchievementBadgesProps) {
  const earnedAchievements = checkAchievements(stats)
  const earnedIds = new Set(earnedAchievements.map((a) => a.id))

  // Get next achievements in each category
  const nextPredictions = getNextAchievement('predictions', stats.totalPredictions)
  const nextAccuracy = getNextAchievement('accuracy', stats.accuracy)
  const nextStreak = getNextAchievement('streak', stats.currentStreak)
  const nextPoints = getNextAchievement('points', stats.totalPoints)

  const upcomingAchievements = [nextPredictions, nextAccuracy, nextStreak, nextPoints].filter(
    (item): item is { achievement: Achievement; progress: number } => item !== null
  )

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Achievements ({earnedAchievements.length}/{ACHIEVEMENTS.length})
      </h3>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Unlocked</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {earnedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                title={achievement.description}
              >
                <div className="text-3xl mb-1">{achievement.icon}</div>
                <p className="text-xs font-semibold text-gray-900">{achievement.name}</p>
                <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {upcomingAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">In Progress</h4>
          <div className="space-y-3">
            {upcomingAchievements.map(({ achievement, progress }) => (
              <div key={achievement.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl opacity-50">{achievement.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{achievement.name}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Locked</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ACHIEVEMENTS.filter((a) => !earnedIds.has(a.id))
            .filter(
              (a) => !upcomingAchievements.some((upcoming) => upcoming.achievement.id === a.id)
            )
            .map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-center opacity-50"
                title={achievement.description}
              >
                <div className="text-3xl mb-1 grayscale">{achievement.icon}</div>
                <p className="text-xs font-semibold text-gray-600">{achievement.name}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
