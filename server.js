import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

const PORT = process.env.PORT || 3001

app.use(express.static(join(__dirname, 'dist')))
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

const JOKES_API = 'https://raw.githubusercontent.com/Team-WAVE-x/Stop-uncle/master/src/ajegag.json'

let allJokes = []

async function loadJokes() {
  try {
    const res = await fetch(JOKES_API)
    const data = await res.json()
    const problems = data.problems || []
    const seen = new Set()
    for (const p of problems) {
      if (!seen.has(p.quiz)) {
        seen.add(p.quiz)
        allJokes.push({ quiz: p.quiz, answer: p.answer[0] || '' })
      }
    }
    console.log(`✅ 아재개그 ${allJokes.length}개 로드 완료`)
  } catch (e) {
    console.error('❌ 아재개그 로드 실패:', e.message)
  }
}

// ========== TIER SYSTEM ==========
const TIERS = [
  { id: 'bronze',   name: '브론즈',   icon: '🥉', color: '#cd7f32', minMMR: 0,    maxMMR: 1199 },
  { id: 'silver',   name: '실버',     icon: '🥈', color: '#c0c0c0', minMMR: 1200, maxMMR: 1599 },
  { id: 'gold',     name: '골드',     icon: '🥇', color: '#ffd700', minMMR: 1600, maxMMR: 1999 },
  { id: 'platinum', name: '플래티넘', icon: '💎', color: '#00d4ff', minMMR: 2000, maxMMR: 2399 },
  { id: 'diamond',  name: '다이아몬드',icon: '👑', color: '#b9f2ff', minMMR: 2400, maxMMR: 2799 },
  { id: 'challenger',name: '챌린저',  icon: '🏆', color: '#ff6b6b', minMMR: 2800, maxMMR: Infinity },
]

function getTier(mmr) {
  for (const tier of TIERS) {
    if (mmr >= tier.minMMR && mmr <= tier.maxMMR) return tier
  }
  return TIERS[0]
}

function calculateELO(winnerMMR, loserMMR, isDraw = false) {
  const K = 32
  const expectedWinner = 1 / (1 + Math.pow(10, (loserMMR - winnerMMR) / 400))
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerMMR - loserMMR) / 400))

  if (isDraw) {
    return {
      winnerChange: Math.round(K * (0.5 - expectedWinner)),
      loserChange: Math.round(K * (0.5 - expectedLoser)),
    }
  }

  return {
    winnerChange: Math.round(K * (1 - expectedWinner)),
    loserChange: Math.round(K * (0 - expectedLoser)),
  }
}

// ========== USER STATS ==========
const userStats = new Map()

function getUserStats(username) {
  if (!userStats.has(username)) {
    userStats.set(username, {
      username,
      mmr: 1000,
      tier: 'bronze',
      wins: 0,
      losses: 0,
      draws: 0,
      winStreak: 0,
      maxWinStreak: 0,
      totalGames: 0,
      totalScore: 0,
      totalCorrect: 0,
      avgTime: 0,
      rankPoints: 0,
      seasonWins: 0,
      seasonLosses: 0,
      seasonStartMMR: 1000,
      history: [],
      createdAt: new Date().toISOString(),
    })
  }
  return userStats.get(username)
}

function recordMatch(roomId, results, mode) {
  const match = {
    id: roomId,
    mode,
    timestamp: new Date().toISOString(),
    season: currentSeason.number,
    players: results.map((r, i) => ({
      username: r.username,
      rank: i + 1,
      score: r.score,
      correctCount: r.correctCount,
      avgTime: r.avgTime,
    })),
  }

  if (mode === '1v1' && results.length === 2) {
    const p1 = getUserStats(results[0].username)
    const p2 = getUserStats(results[1].username)

    const s1 = results[0].score
    const s2 = results[1].score

    let winnerChange, loserChange
    if (s1 === s2) {
      const changes = calculateELO(p1.mmr, p2.mmr, true)
      winnerChange = changes.winnerChange
      loserChange = changes.loserChange
      p1.draws++
      p2.draws++
      match.result = 'draw'
    } else {
      const winner = s1 > s2 ? p1 : p2
      const loser = s1 > s2 ? p2 : p1
      const changes = calculateELO(winner.mmr, loser.mmr)
      winnerChange = changes.winnerChange
      loserChange = changes.loserChange
      winner.wins++
      winner.winStreak++
      winner.maxWinStreak = Math.max(winner.maxWinStreak, winner.winStreak)
      loser.losses++
      loser.winStreak = 0
      match.result = 'win'
      match.winner = winner.username
    }

    p1.mmr += (s1 >= s2 ? winnerChange : loserChange)
    p2.mmr += (s2 >= s1 ? winnerChange : loserChange)

    p1.mmr = Math.max(0, p1.mmr)
    p2.mmr = Math.max(0, p2.mmr)

    p1.tier = getTier(p1.mmr).id
    p2.tier = getTier(p2.mmr).id

    p1.totalGames++
    p2.totalGames++

    p1.rankPoints += (s1 >= s2 ? (s1 > s2 ? 25 : 5) : -10)
    p2.rankPoints += (s2 >= s1 ? (s2 > s1 ? 25 : 5) : -10)
    p1.rankPoints = Math.max(0, p1.rankPoints)
    p2.rankPoints = Math.max(0, p2.rankPoints)

    p1.history.unshift(match)
    p2.history.unshift(match)
    if (p1.history.length > 50) p1.history.length = 50
    if (p2.history.length > 50) p2.history.length = 50

    p1.seasonWins += (s1 > s2 ? 1 : 0)
    p1.seasonLosses += (s1 < s2 ? 1 : 0)
    p2.seasonWins += (s2 > s1 ? 1 : 0)
    p2.seasonLosses += (s2 < s1 ? 1 : 0)

    match.mmrChanges = {
      [results[0].username]: s1 >= s2 ? winnerChange : loserChange,
      [results[1].username]: s2 >= s1 ? winnerChange : loserChange,
    }
  } else {
    results.forEach((r, i) => {
      const stats = getUserStats(r.username)
      stats.totalGames++
      stats.totalScore += r.score
      stats.totalCorrect += r.correctCount
      stats.avgTime = stats.totalCorrect > 0
        ? Math.round((stats.totalCorrect * (stats.avgTime || 0) + r.correctCount * r.avgTime) / stats.totalCorrect * 10) / 10
        : 0
      stats.history.unshift(match)
      if (stats.history.length > 50) stats.history.length = 50
    })
    match.result = 'group'
  }

  io.emit('stats-update', getAllUserStats())
  return match
}

function getAllUserStats() {
  const stats = {}
  for (const [name, data] of userStats) {
    stats[name] = { ...data }
  }
  return stats
}

function getLeaderboard() {
  const list = []
  for (const [name, data] of userStats) {
    list.push({
      username: name,
      mmr: data.mmr,
      tier: getTier(data.mmr),
      wins: data.wins,
      losses: data.losses,
      draws: data.draws,
      winRate: data.totalGames > 0 ? Math.round((data.wins / data.totalGames) * 100) : 0,
      totalGames: data.totalGames,
      winStreak: data.winStreak,
      maxWinStreak: data.maxWinStreak,
      rankPoints: data.rankPoints,
      seasonWins: data.seasonWins,
      seasonLosses: data.seasonLosses,
    })
  }
  list.sort((a, b) => b.mmr - a.mmr)
  return list
}

// ========== SEASON SYSTEM ==========
const currentSeason = {
  number: 1,
  name: '시즌 1',
  startDate: new Date().toISOString(),
  endDate: null,
}

function resetSeason() {
  for (const [, stats] of userStats) {
    stats.seasonWins = 0
    stats.seasonLosses = 0
    stats.seasonStartMMR = stats.mmr
  }
  currentSeason.number++
  currentSeason.name = `시즌 ${currentSeason.number}`
  currentSeason.startDate = new Date().toISOString()
  io.emit('season-update', currentSeason)
}

// ========== ROOM SYSTEM ==========
function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

function pickRandomJokes(count) {
  const shuffled = [...allJokes].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

const rooms = new Map()

function getRoom(roomId) {
  return rooms.get(roomId)
}

function broadcastRoomList() {
  const list = []
  for (const [id, room] of rooms) {
    if (room.phase === 'waiting') {
      list.push({
        id,
        host: room.host,
        mode: room.mode,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        questionCount: room.questionCount,
        ranked: room.ranked || false,
      })
    }
  }
  io.emit('room-list', list)
}

function createRoom(hostName, mode, questionCount, maxPlayers, ranked = false) {
  let roomId = generateRoomId()
  while (rooms.has(roomId)) roomId = generateRoomId()

  const room = {
    host: hostName,
    mode,
    questionCount,
    maxPlayers: mode === '1v1' ? 2 : Math.min(maxPlayers || 8, 8),
    phase: 'waiting',
    players: new Map(),
    questions: [],
    currentQuestion: 0,
    scores: new Map(),
    answerTimes: new Map(),
    submittedCount: 0,
    timer: null,
    timeLeft: 0,
    ranked,
  }
  rooms.set(roomId, room)
  return roomId
}

function startGame(roomId) {
  const room = getRoom(roomId)
  if (!room || room.players.size < 2) return false

  room.phase = 'playing'
  room.questions = pickRandomJokes(room.questionCount)
  room.currentQuestion = 0
  room.scores = new Map()
  room.answerTimes = new Map()

  for (const [name] of room.players) {
    room.scores.set(name, 0)
    room.answerTimes.set(name, new Map())
  }

  broadcastRoomList()
  sendQuestion(roomId)
  return true
}

function sendQuestion(roomId) {
  const room = getRoom(roomId)
  if (!room) return

  if (room.currentQuestion >= room.questions.length) {
    endGame(roomId)
    return
  }

  room.submittedCount = 0
  const q = room.questions[room.currentQuestion]
  room.timeLeft = 15

  io.to(roomId).emit('question', {
    index: room.currentQuestion,
    total: room.questions.length,
    quiz: q.quiz,
    timeLimit: 15,
  })

  if (room.timer) clearInterval(room.timer)
  room.timer = setInterval(() => {
    room.timeLeft--
    io.to(roomId).emit('timer-tick', room.timeLeft)
    if (room.timeLeft <= 0) {
      clearInterval(room.timer)
      room.timer = null
      handleTimeUp(roomId)
    }
  }, 1000)
}

function handleTimeUp(roomId) {
  const room = getRoom(roomId)
  if (!room || room.phase !== 'playing') return

  const q = room.questions[room.currentQuestion]
  io.to(roomId).emit('time-up', {
    answer: q.answer,
    scores: Object.fromEntries(room.scores),
  })

  room.currentQuestion++
  setTimeout(() => sendQuestion(roomId), 3000)
}

function endGame(roomId) {
  const room = getRoom(roomId)
  if (!room) return

  if (room.timer) {
    clearInterval(room.timer)
    room.timer = null
  }

  room.phase = 'finished'

  const results = []
  for (const [name, score] of room.scores) {
    const times = room.answerTimes.get(name)
    let correctCount = 0
    let totalCorrectTime = 0
    if (times) {
      for (const [, data] of times) {
        if (data.correct) {
          correctCount++
          totalCorrectTime += data.time
        }
      }
    }
    results.push({
      username: name,
      score,
      correctCount,
      avgTime: correctCount > 0 ? Math.round(totalCorrectTime / correctCount / 100) / 10 : 0,
    })
  }

  results.sort((a, b) => b.score - a.score || b.correctCount - a.correctCount)

  let matchResult = null
  if (room.ranked && room.mode === '1v1') {
    matchResult = recordMatch(roomId, results, '1v1')
  } else {
    results.forEach(r => {
      const stats = getUserStats(r.username)
      stats.totalGames++
      stats.totalScore += r.score
      stats.totalCorrect += r.correctCount
    })
    matchResult = { result: 'group', players: results.map(r => r.username) }
  }

  io.to(roomId).emit('game-over', {
    results,
    match: matchResult,
    ranked: room.ranked || false,
  })

  broadcastRoomList()
}

// ========== MATCHMAKING ==========
const matchmakingQueue = new Map()

function findMatch(username) {
  const userStatsData = getUserStats(username)
  const userMMR = userStatsData.mmr

  let bestMatch = null
  let bestDiff = Infinity

  for (const [name, data] of matchmakingQueue) {
    if (name === username) continue
    const diff = Math.abs(userMMR - data.mmr)
    const waitTime = Date.now() - data.joinedAt
    const adjustedDiff = diff - (waitTime / 1000) * 2

    if (adjustedDiff < bestDiff) {
      bestDiff = adjustedDiff
      bestMatch = name
    }
  }

  return bestMatch
}

// ========== SOCKET.IO ==========
io.on('connection', (socket) => {
  console.log(`🔌 연결: ${socket.id}`)

  socket.emit('room-list', Array.from(rooms.entries())
    .filter(([, r]) => r.phase === 'waiting')
    .map(([id, r]) => ({
      id,
      host: r.host,
      mode: r.mode,
      playerCount: r.players.size,
      maxPlayers: r.maxPlayers,
      questionCount: r.questionCount,
      ranked: r.ranked || false,
    }))
  )

  socket.emit('stats-update', getAllUserStats())
  socket.emit('season-update', currentSeason)
  socket.emit('leaderboard-update', getLeaderboard())

  socket.on('get-user-stats', ({ username }, cb) => {
    const stats = getUserStats(username)
    cb({ stats: { ...stats }, tier: getTier(stats.mmr) })
  })

  socket.on('get-leaderboard', (cb) => {
    cb(getLeaderboard())
  })

  socket.on('get-season', (cb) => {
    cb(currentSeason)
  })

  socket.on('create-room', ({ username, mode, questionCount, maxPlayers, ranked }, cb) => {
    if (!username || !mode) return cb({ error: '입력이 올바르지 않습니다.' })
    const count = Math.min(Math.max(parseInt(questionCount) || 10, 5), 30)
    const roomId = createRoom(username, mode, count, maxPlayers, ranked)
    const room = getRoom(roomId)

    room.players.set(username, { socketId: socket.id })
    socket.join(roomId)
    socket.data = { username, roomId }

    broadcastRoomList()
    cb({ roomId })
  })

  socket.on('join-room', ({ roomId, username }, cb) => {
    if (!username) return cb({ error: '로그인이 필요합니다.' })
    const room = getRoom(roomId)
    if (!room) return cb({ error: '방을 찾을 수 없습니다.' })
    if (room.phase !== 'waiting') return cb({ error: '이미 게임이 진행 중입니다.' })
    if (room.players.size >= room.maxPlayers) return cb({ error: '방이 가득 찼습니다.' })

    for (const [name] of room.players) {
      if (name === username) return cb({ error: '이미 방에 참여되어 있습니다.' })
    }

    room.players.set(username, { socketId: socket.id })
    socket.join(roomId)
    socket.data = { username, roomId }

    io.to(roomId).emit('player-joined', {
      players: Array.from(room.players.keys()),
      host: room.host,
    })

    broadcastRoomList()
    cb({ roomId })
  })

  socket.on('leave-room', () => {
    handleLeave(socket)
  })

  socket.on('start-game', ({ roomId }, cb) => {
    const room = getRoom(roomId)
    if (!room) return cb({ error: '방을 찾을 수 없습니다.' })
    if (socket.data?.username !== room.host) return cb({ error: '방장만 게임을 시작할 수 있습니다.' })
    if (room.players.size < 2) return cb({ error: '최소 2명이 필요합니다.' })

    const success = startGame(roomId)
    if (!success) return cb({ error: '게임 시작에 실패했습니다.' })
    cb({ ok: true })
  })

  socket.on('submit-answer', ({ roomId, answer }, cb) => {
    const room = getRoom(roomId)
    if (!room || room.phase !== 'playing') return
    const username = socket.data?.username
    if (!username || !room.players.has(username)) return

    const times = room.answerTimes.get(username)
    if (times && times.has(room.currentQuestion)) return

    const q = room.questions[room.currentQuestion]
    const normalized = (s) => s.replace(/\s+/g, '').toLowerCase()
    const isCorrect = q.answer.split(',').some(a => normalized(a) === normalized(answer))
    const elapsed = (15 - room.timeLeft) * 1000

    if (!room.answerTimes.has(username)) room.answerTimes.set(username, new Map())
    room.answerTimes.get(username).set(room.currentQuestion, { correct: isCorrect, time: elapsed })

    if (isCorrect) {
      const timeBonus = Math.max(0, Math.floor((room.timeLeft / 15) * 5))
      const currentScore = room.scores.get(username) || 0
      room.scores.set(username, currentScore + 10 + timeBonus)
    }

    room.submittedCount++
    io.to(roomId).emit('player-answered', {
      username,
      answeredCount: room.submittedCount,
      totalPlayers: room.players.size,
    })

    if (cb) cb({ isCorrect })

    const allAnswered = room.submittedCount >= room.players.size
    if (allAnswered && room.timer) {
      clearInterval(room.timer)
      room.timer = null
      const ans = q.answer
      io.to(roomId).emit('time-up', {
        answer: ans,
        scores: Object.fromEntries(room.scores),
      })
      room.currentQuestion++
      setTimeout(() => sendQuestion(roomId), 3000)
    }
  })

  socket.on('get-rooms', () => {
    const list = []
    for (const [id, room] of rooms) {
      if (room.phase === 'waiting') {
        list.push({
          id,
          host: room.host,
          mode: room.mode,
          playerCount: room.players.size,
          maxPlayers: room.maxPlayers,
          questionCount: room.questionCount,
          ranked: room.ranked || false,
        })
      }
    }
    socket.emit('room-list', list)
  })

  // ========== MATCHMAKING ==========
  socket.on('join-matchmaking', ({ username }, cb) => {
    if (!username) return cb({ error: '로그인이 필요합니다.' })

    matchmakingQueue.set(username, {
      socketId: socket.id,
      mmr: getUserStats(username).mmr,
      joinedAt: Date.now(),
    })

    socket.data = { username, matchmaking: true }

    const matchedUsername = findMatch(username)
    if (matchedUsername && matchmakingQueue.has(matchedUsername)) {
      const matchedData = matchmakingQueue.get(matchedUsername)
      matchmakingQueue.delete(username)
      matchmakingQueue.delete(matchedUsername)

      const matchedSocket = io.sockets.sockets.get(matchedData?.socketId)
      if (!matchedSocket) {
        cb({ matched: false, queuePosition: matchmakingQueue.size })
        return
      }

      const count = 10
      const roomId = createRoom(username, '1v1', count, 2, true)
      const room = getRoom(roomId)

      room.players.set(username, { socketId: socket.id })
      room.players.set(matchedUsername, { socketId: matchedData.socketId })
      socket.join(roomId)
      matchedSocket?.join(roomId)

      socket.data.roomId = roomId
      if (matchedSocket) {
        matchedSocket.data = { username: matchedUsername, roomId }
      }

      io.to(roomId).emit('player-joined', {
        players: Array.from(room.players.keys()),
        host: room.host,
      })

      io.to(roomId).emit('match-found', { roomId, ranked: true })
      broadcastRoomList()
      cb({ matched: true, roomId })
    } else {
      cb({ matched: false, queuePosition: matchmakingQueue.size })
    }
  })

  socket.on('leave-matchmaking', ({ username }) => {
    matchmakingQueue.delete(username)
    if (socket.data?.matchmaking) {
      socket.data.matchmaking = false
    }
  })

  socket.on('disconnect', () => {
    console.log(`🔌 해제: ${socket.id}`)
    if (socket.data?.username) {
      matchmakingQueue.delete(socket.data.username)
    }
    handleLeave(socket)
  })

  function handleLeave(sock) {
    const data = sock.data
    if (!data || !data.roomId) return
    const room = getRoom(data.roomId)
    if (!room) return

    room.players.delete(data.username)
    sock.leave(data.roomId)

    if (room.players.size === 0) {
      if (room.timer) clearInterval(room.timer)
      rooms.delete(data.roomId)
    } else {
      if (room.host === data.username) {
        room.host = room.players.keys().next().value
      }
      io.to(data.roomId).emit('player-left', {
        username: data.username,
        players: Array.from(room.players.keys()),
        host: room.host,
      })
    }

    broadcastRoomList()
    sock.data = null
  }
})

loadJokes().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`)
  })
})
