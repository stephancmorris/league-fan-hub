import Link from 'next/link'
import { UserMenu } from '@/components/auth'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-8">
      <header className="w-full max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-900">NRL Fan Hub</h1>
          <UserMenu />
        </div>
      </header>
      <div className="z-10 max-w-5xl w-full mx-auto items-center justify-between font-mono text-sm">
        <h2 className="text-4xl font-bold text-center mb-8">Welcome to NRL Fan Hub</h2>
        <p className="text-center text-lg mb-4">
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
          <div className="p-6 border border-gray-200 rounded-lg opacity-75">
            <h2 className="text-xl font-semibold mb-2">Make Predictions</h2>
            <p className="text-gray-600">Compete with other fans</p>
            <span className="text-xs text-gray-400 mt-2 inline-block">Coming soon</span>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg opacity-75">
            <h2 className="text-xl font-semibold mb-2">Leaderboards</h2>
            <p className="text-gray-600">Climb the ranks</p>
            <span className="text-xs text-gray-400 mt-2 inline-block">Coming soon</span>
          </div>
        </div>
      </div>
    </main>
  )
}
