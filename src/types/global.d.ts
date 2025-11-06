import { Server as SocketIOServer } from 'socket.io'

declare global {
  var io: SocketIOServer & {
    broadcastScoreUpdate: (matchId: string, homeScore: number, awayScore: number) => void
    broadcastStatusUpdate: (matchId: string, status: string, data?: Record<string, unknown>) => void
  }

  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R
    }

    interface JestMatchers<_T = unknown> {
      toHaveNoViolations(): void
    }
  }
}

export {}
