import { useState, useEffect, useCallback, useRef } from 'react'
import BattleRoom from './BattleRoom'

const TIERS = [
  { id: 'bronze', name: '브론즈', icon: '🥉', color: '#cd7f32', minMMR: 0, maxMMR: 1199 },
  { id: 'silver', name: '실버', icon: '🥈', color: '#c0c0c0', minMMR: 1200, maxMMR: 1599 },
  { id: 'gold', name: '골드', icon: '🥇', color: '#ffd700', minMMR: 1600, maxMMR: 1999 },
  { id: 'platinum', name: '플래티넘', icon: '💎', color: '#00d4ff', minMMR: 2000, maxMMR: 2399 },
  { id: 'diamond', name: '다이아몬드', icon: '👑', color: '#b9f2ff', minMMR: 2400, maxMMR: 2799 },
  { id: 'challenger', name: '챌린저', icon: '🏆', color: '#ff6b6b', minMMR: 2800, maxMMR: Infinity },
]

function getTierInfo(tierId) {
  return TIERS.find(t => t.id === tierId) || TIERS[0]
}

export default function RankedMatchPage({ socket, user, onLoginPrompt }) {
  const [userStats, setUserStats] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [error, setError] = useState('')
  const searchTimer = useRef(null)

  useEffect(() => {
    if (!socket || !user) return

    socket.emit('get-user-stats', { username: user }, ({ stats, tier }) => {
      setUserStats({ ...stats, tier })
    })

    socket.emit('get-leaderboard', (lb) => {
      setLeaderboard(lb)
    })

    socket.on('stats-update', (allStats) => {
      if (allStats[user]) {
        setUserStats({ ...allStats[user], tier: getTierInfo(allStats[user].tier) })
      }
    })

    socket.on('leaderboard-update', (lb) => {
      setLeaderboard(lb)
    })

    socket.on('match-found', ({ roomId, ranked }) => {
      setIsSearching(false)
      setCurrentRoom(roomId)
      setSearchTime(0)
    })

    return () => {
      socket.off('stats-update')
      socket.off('leaderboard-update')
      socket.off('match-found')
    }
  }, [socket, user])

  useEffect(() => {
    if (isSearching) {
      searchTimer.current = setInterval(() => {
        setSearchTime(t => t + 1)
      }, 1000)
    } else {
      if (searchTimer.current) clearInterval(searchTimer.current)
      setSearchTime(0)
    }
    return () => { if (searchTimer.current) clearInterval(searchTimer.current) }
  }, [isSearching])

  const handleStartSearch = useCallback(() => {
    if (!user) { onLoginPrompt(); return }
    setError('')
    setIsSearching(true)

    socket.emit('join-matchmaking', { username: user }, ({ matched, roomId, error: err }) => {
      if (err) {
        setError(err)
        setIsSearching(false)
        return
      }
      if (matched) {
        setCurrentRoom(roomId)
        setIsSearching(false)
      }
    })
  }, [socket, user, onLoginPrompt])

  const handleCancelSearch = useCallback(() => {
    socket.emit('leave-matchmaking', { username: user })
    setIsSearching(false)
  }, [socket, user])

  const handleBackToLobby = useCallback(() => {
    setCurrentRoom(null)
    socket.emit('get-leaderboard', (lb) => setLeaderboard(lb))
    if (user) {
      socket.emit('get-user-stats', { username: user }, ({ stats, tier }) => {
        setUserStats({ ...stats, tier })
      })
    }
  }, [socket, user])

  if (currentRoom) {
    return (
      <BattleRoom
        socket={socket}
        roomId={currentRoom}
        username={user}
        onLeave={handleBackToLobby}
      />
    )
  }

  const tier = userStats?.tier || getTierInfo('bronze')
  const winRate = userStats?.totalGames > 0
    ? Math.round((userStats.wins / userStats.totalGames) * 100)
    : 0

  return (
    <div className="ranked-page">
      <div className="ranked-header">
        <h2 className="ranked-title">🏆 랭크 매치</h2>
        <div className="ranked-season-badge">시즌 1</div>
      </div>

      {user && userStats ? (
        <div className="ranked-profile-card">
          <div className="ranked-tier-display" style={{ borderColor: tier.color }}>
            <span className="ranked-tier-icon">{tier.icon}</span>
            <div className="ranked-tier-info">
              <span className="ranked-tier-name" style={{ color: tier.color }}>{tier.name}</span>
              <span className="ranked-mmr">{userStats.mmr} MMR</span>
            </div>
          </div>
          <div className="ranked-stats-row">
            <div className="ranked-stat">
              <span className="ranked-stat-value" style={{ color: '#4ecdc4' }}>{userStats.wins}</span>
              <span className="ranked-stat-label">승</span>
            </div>
            <div className="ranked-stat">
              <span className="ranked-stat-value" style={{ color: '#ff6b6b' }}>{userStats.losses}</span>
              <span className="ranked-stat-label">패</span>
            </div>
            <div className="ranked-stat">
              <span className="ranked-stat-value" style={{ color: '#ffd700' }}>{winRate}%</span>
              <span className="ranked-stat-label">승률</span>
            </div>
            <div className="ranked-stat">
              <span className="ranked-stat-value" style={{ color: '#ff69b4' }}>{userStats.maxWinStreak}</span>
              <span className="ranked-stat-label">최다연승</span>
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="ranked-loading">
          <div className="loader"><div className="loader-dot"></div><div className="loader-dot"></div><div className="loader-dot"></div></div>
          <p>전적 불러오는 중...</p>
        </div>
      ) : (
        <div className="ranked-login-prompt" onClick={onLoginPrompt}>
          <span className="ranked-login-icon">🔐</span>
          <p>랭크 매치를 플레이하려면 로그인이 필요합니다</p>
          <button className="btn btn-reveal" onClick={onLoginPrompt}>로그인 / 회원가입</button>
        </div>
      )}

      {error && <p className="battle-error">{error}</p>}

      {isSearching ? (
        <div className="ranked-searching">
          <div className="searching-animation">
            <div className="searching-ring"></div>
            <div className="searching-ring ring-2"></div>
            <div className="searching-text">{searchTime}초</div>
          </div>
          <p className="searching-status">상대를 찾는 중...</p>
          <p className="searching-hint">MMR이 비슷한 상대를 매칭하고 있습니다</p>
          <button className="btn btn-cancel-search" onClick={handleCancelSearch}>
            매칭 취소
          </button>
        </div>
      ) : (
        <button
          className="btn btn-ranked-start"
          onClick={handleStartSearch}
          disabled={!user}
        >
          <span className="btn-icon">⚔️</span>
          랭크 매칭 시작
        </button>
      )}

      {leaderboard.length > 0 && (
        <div className="ranked-leaderboard-section">
          <h3 className="ranked-lb-title">🏆 랭커보드</h3>
          <div className="ranked-lb-list">
            {leaderboard.slice(0, 20).map((entry, idx) => {
              const entryTier = entry.tier || getTierInfo('bronze')
              return (
                <div
                  key={entry.username}
                  className={`ranked-lb-item ${idx < 3 ? 'ranked-lb-top' : ''} ${entry.username === user ? 'ranked-lb-me' : ''}`}
                >
                  <span className="ranked-lb-rank">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                  </span>
                  <span className="ranked-lb-tier" style={{ color: entryTier.color }}>{entryTier.icon}</span>
                  <span className="ranked-lb-name">{entry.username}</span>
                  <span className="ranked-lb-record">{entry.wins}승 {entry.losses}패</span>
                  <span className="ranked-lb-mmr">{entry.mmr} MMR</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
