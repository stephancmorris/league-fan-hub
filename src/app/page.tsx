import Link from 'next/link'
import { UserMenu } from '@/components/auth'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">NRL Fan Hub</h1>
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
          Welcome to NRL Fan Hub
        </h2>
        <p className="text-center text-lg mb-8 text-gray-600">
          Your ultimate destination for live NRL scores and predictions
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link
            href="/matches"
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold mb-2 text-primary-600">Live Matches</h2>
            <p className="text-gray-600">Follow real-time scores and updates</p>
          </Link>
          <Link
            href="/predictions"
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold mb-2 text-primary-600">Make Predictions</h2>
            <p className="text-gray-600">Compete with other fans and earn points</p>
          </Link>
          <Link
            href="/leaderboard"
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold mb-2 text-primary-600">Leaderboards</h2>
            <p className="text-gray-600">Climb the ranks and compete globally</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
