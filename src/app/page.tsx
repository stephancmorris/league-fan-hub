export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          NRL Fan Hub
        </h1>
        <p className="text-center text-lg mb-4">
          Your ultimate destination for live NRL scores and predictions
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Live Matches</h2>
            <p className="text-gray-600">Follow real-time scores and updates</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Make Predictions</h2>
            <p className="text-gray-600">Compete with other fans</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Leaderboards</h2>
            <p className="text-gray-600">Climb the ranks</p>
          </div>
        </div>
      </div>
    </main>
  )
}
