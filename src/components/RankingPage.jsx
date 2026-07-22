import { useMemo, useState, useEffect } from 'react'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('geguejjang-users') || '{}')
  } catch { return {} }
}

const MEDALS = [
  { emoji: '🥇', label: '금메달', color: '#ffd700', bg: 'rgba(255, 215, 0, 0.1)', border: 'rgba(255, 215, 0, 0.3)' },
  { emoji: '🥈', label: '은메달', color: '#c0c0c0', bg: 'rgba(192, 192, 192, 0.1)', border: 'rgba(192, 192, 192, 0.3)' },
  { emoji: '🥉', label: '동메달', color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.1)', border: 'rgba(205, 127, 50, 0.3)' },
]

const TIERS = [
  { id: 'bronze', name: '브론즈', icon: '🥉', color: '#cd7f32' },
  { id: 'silver', name: '실버', icon: '🥈', color: '#c0c0c0' },
  { id: 'gold', name: '골드', icon: '🥇', color: '#ffd700' },
  { id: 'platinum', name: '플래티넘', icon: '💎', color: '#00d4ff' },
  { id: 'diamond', name: '다이아몬드', icon: '👑', color: '#b9f2ff' },
  { id: 'challenger', name: '챌린저', icon: '🏆', color: '#ff6b6b' },
]

function getTierInfo(tierId) {
  return TIERS.find(t => t.id === tierId) || TIERS[0]
}

export default function RankingPage({ jokeRankings, currentUser, socket }) {
  const [serverStats, setServerStats] = useState({})

  useEffect(() => {
    if (!socket) return

    socket.emit('get-leaderboard', (lb) => {
      const statsMap = {}
      lb.forEach(s => { statsMap[s.username] = s })
      setServerStats(statsMap)
    })

    socket.on('leaderboard-update', (lb) => {
      const statsMap = {}
      lb.forEach(s => { statsMap[s.username] = s })
      setServerStats(statsMap)
    })

    return () => { socket.off('leaderboard-update') }
  }, [socket])

  const users = useMemo(() => {
    const raw = getUsers()
    return Object.entries(raw)
      .map(([name, data]) => {
        const stats = serverStats[name] || {}
        return {
          username: name,
          points: data.points || 0,
          correctCount: data.correctCount || 0,
          mmr: stats.mmr || 1000,
          tier: getTierInfo(stats.tier || 'bronze'),
          wins: stats.wins || 0,
          losses: stats.losses || 0,
          winRate: stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0,
          totalGames: stats.totalGames || 0,
        }
      })
      .sort((a, b) => b.mmr - a.mmr || b.points - a.points)
  }, [serverStats])

  const jokeTop = useMemo(() => {
    return jokeRankings.slice(0, 20)
  }, [jokeRankings])

  const hasJokeRankings = jokeTop.length > 0 && jokeTop.some(j => j.likes > 0)
  const hasUserRankings = users.length > 0

  return (
    <div className="ranking-container">
      <div className="ranking-section">
        <h2 className="ranking-heading">
          <span className="ranking-icon">💬</span>
          인기 아재개그 순위
        </h2>
        {!hasJokeRankings ? (
          <div className="ranking-empty">
            <span className="ranking-empty-icon">📭</span>
            <p>아직 좋아요가 있는 아재개그가 없습니다.</p>
            <p className="ranking-empty-sub">좋아요를 눌러 인기 순위를 만들어보세요!</p>
          </div>
        ) : (
          <div className="ranking-list">
            {jokeTop.map((joke, idx) => {
              const medal = MEDALS[idx]
              return (
                <div
                  key={joke.id}
                  className={`ranking-item ${idx < 3 ? 'ranking-item-top' : ''}`}
                  style={medal ? {
                    background: medal.bg,
                    borderColor: medal.border,
                  } : undefined}
                >
                  <div className="ranking-rank">
                    {medal ? (
                      <span className="medal-icon">{medal.emoji}</span>
                    ) : (
                      <span className="rank-number">{idx + 1}</span>
                    )}
                  </div>
                  <div className="ranking-content">
                    <p className="ranking-question">{joke.quiz}</p>
                    <p className="ranking-answer">정답: {joke.answer}</p>
                  </div>
                  <div className="ranking-score">
                    <span className="ranking-heart">❤️</span>
                    <span className="ranking-score-value">{joke.likes}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="ranking-section">
        <h2 className="ranking-heading">
          <span className="ranking-icon">🏆</span>
          유저 랭킹
        </h2>
        {!hasUserRankings ? (
          <div className="ranking-empty">
            <span className="ranking-empty-icon">👤</span>
            <p>아직 유저가 없습니다.</p>
            <p className="ranking-empty-sub">로그인하고 아재개그를 풀어보세요!</p>
          </div>
        ) : (
          <div className="ranking-list">
            {users.map((user, idx) => {
              const medal = MEDALS[idx]
              const isMe = currentUser === user.username
              return (
                <div
                  key={user.username}
                  className={`ranking-item ranking-user-item ${idx < 3 ? 'ranking-item-top' : ''} ${isMe ? 'ranking-me' : ''}`}
                  style={medal ? {
                    background: medal.bg,
                    borderColor: medal.border,
                  } : undefined}
                >
                  <div className="ranking-rank">
                    {medal ? (
                      <span className="medal-icon">{medal.emoji}</span>
                    ) : (
                      <span className="rank-number">{idx + 1}</span>
                    )}
                  </div>
                  <div className="ranking-content">
                    <p className="ranking-username">
                      <span className="ranking-tier-icon" style={{ color: user.tier.color }}>{user.tier.icon}</span>
                      {user.username}
                      {isMe && <span className="me-badge">나</span>}
                    </p>
                    <p className="ranking-stats">
                      {user.totalGames > 0 ? (
                        <>
                          <strong>{user.wins}승</strong> <strong>{user.losses}패</strong>
                          <span className="ranking-winrate"> ({user.winRate}%)</span>
                        </>
                      ) : (
                        <>
                          정답 <strong>{user.correctCount}</strong>개
                        </>
                      )}
                    </p>
                  </div>
                  <div className="ranking-score">
                    <span className="ranking-mmr">{user.mmr} MMR</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
