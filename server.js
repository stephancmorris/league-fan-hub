/**
 * Custom Node.js server with WebSocket support
 * Runs alongside Next.js for live match updates
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)
const wsPort = parseInt(process.env.WS_PORT || '3001', 10)

// Prepare Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server for Next.js
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create separate HTTP server for WebSocket
  const wsServer = createServer()
  const io = new Server(wsServer, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_APP_URL
          : `http://localhost:${port}`,
      methods: ['GET', 'POST'],
    },
  })

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Join match room
    socket.on('subscribe:match', (matchId) => {
      socket.join(`match:${matchId}`)
      console.log(`Client ${socket.id} subscribed to match:${matchId}`)
    })

    // Leave match room
    socket.on('unsubscribe:match', (matchId) => {
      socket.leave(`match:${matchId}`)
      console.log(`Client ${socket.id} unsubscribed from match:${matchId}`)
    })

    // Join all matches room (for match list)
    socket.on('subscribe:all-matches', () => {
      socket.join('all-matches')
      console.log(`Client ${socket.id} subscribed to all matches`)
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  // Broadcast match update to specific match room
  io.broadcastMatchUpdate = (matchId, update) => {
    io.to(`match:${matchId}`).emit('match:update', update)
    io.to('all-matches').emit('match:update', update)
  }

  // Broadcast score update
  io.broadcastScoreUpdate = (matchId, homeScore, awayScore) => {
    const update = {
      matchId,
      type: 'score',
      data: { homeScore, awayScore, updatedAt: new Date().toISOString() },
    }
    io.broadcastMatchUpdate(matchId, update)
  }

  // Broadcast status update
  io.broadcastStatusUpdate = (matchId, status, additionalData = {}) => {
    const update = {
      matchId,
      type: 'status',
      data: { status, ...additionalData, updatedAt: new Date().toISOString() },
    }
    io.broadcastMatchUpdate(matchId, update)
  }

  // Export io instance for API routes
  global.io = io

  // Start servers
  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Next.js server ready on http://${hostname}:${port}`)
    })

  wsServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(wsPort, () => {
      console.log(`> WebSocket server ready on ws://${hostname}:${wsPort}`)
    })
})
