import { useState, useEffect } from 'react'

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

function formatDate(iso) {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours().toString().padStart(2, '0')
  const mins = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${mins}`
}

export default function MatchHistory({ socket, user }) {
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!socket || !user) { setLoading(false); return }

    socket.emit('get-user-stats', { username: user }, ({ stats, tier }) => {
      setUserStats({ ...stats, tier })
      setLoading(false)
    })

    socket.on('stats-update', (allStats) => {
      if (allStats[user]) {
        setUserStats(prev => ({ ...prev, ...allStats[user], tier: getTierInfo(allStats[user].tier) }))
      }
    })

    return () => { socket.off('stats-update') }
  }, [socket, user])

  if (!user) {
    return (
      <div className="match-history-page">
        <h2 className="match-history-title">📋 전적 기록</h2>
        <div className="match-history-empty">
          <span className="match-history-empty-icon">🔐</span>
          <p>로그인하고 전적을 확인하세요!</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="match-history-page">
        <h2 className="match-history-title">📋 전적 기록</h2>
        <div className="match-history-loading">
          <div className="loader"><div className="loader-dot"></div><div className="loader-dot"></div><div className="loader-dot"></div></div>
        </div>
      </div>
    )
  }

  const tier = userStats?.tier || getTierInfo('bronze')
  const winRate = userStats?.totalGames > 0 ? Math.round((userStats.wins / userStats.totalGames) * 100) : 0
  const history = userStats?.history || []

  return (
    <div className="match-history-page">
      <h2 className="match-history-title">📋 전적 기록</h2>

      <div className="match-history-profile">
        <div className="match-profile-tier" style={{ borderColor: tier.color }}>
          <span className="match-profile-tier-icon">{tier.icon}</span>
          <span className="match-profile-tier-name" style={{ color: tier.color }}>{tier.name}</span>
          <span className="match-profile-mmr">{userStats?.mmr || 0} MMR</span>
        </div>
        <div className="match-profile-stats">
          <div className="match-profile-stat">
            <span className="mps-label">총 게임</span>
            <span className="mps-value">{userStats?.totalGames || 0}</span>
          </div>
          <div className="match-profile-stat">
            <span className="mps-label">승</span>
            <span className="mps-value mps-win">{userStats?.wins || 0}</span>
          </div>
          <div className="match-profile-stat">
            <span className="mps-label">패</span>
            <span className="mps-value mps-lose">{userStats?.losses || 0}</span>
          </div>
          <div className="match-profile-stat">
            <span className="mps-label">승률</span>
            <span className="mps-value mps-rate">{winRate}%</span>
          </div>
          <div className="match-profile-stat">
            <span className="mps-label">연승</span>
            <span className="mps-value mps-streak">{userStats?.winStreak || 0}</span>
          </div>
          <div className="match-profile-stat">
            <span className="mps-label">최다연승</span>
            <span className="mps-value mps-max">{userStats?.maxWinStreak || 0}</span>
          </div>
        </div>
      </div>

      <div className="match-history-section">
        <h3 className="match-history-subtitle">매치 기록</h3>
        {history.length === 0 ? (
          <div className="match-history-empty">
            <span className="match-history-empty-icon">🎮</span>
            <p>아직 플레이한 랭크 게임이 없습니다.</p>
            <p className="match-history-empty-sub">랭크 매치에서 승부를 겨뤄보세요!</p>
          </div>
        ) : (
          <div className="match-history-list">
            {history.map((match, idx) => {
              const myData = match.players?.find(p => p.username === user)
              const isWin = match.result === 'win' && match.winner === user
              const isLose = match.result === 'win' && match.winner !== user
              const isDraw = match.result === 'draw'

              return (
                <div
                  key={`${match.id}-${idx}`}
                  className={`match-history-item ${isWin ? 'mh-win' : isLose ? 'mh-lose' : isDraw ? 'mh-draw' : 'mh-group'}`}
                >
                  <div className="mh-result-badge">
                    {isWin ? '승리' : isLose ? '패배' : isDraw ? '무승부' : '그룹'}
                  </div>
                  <div className="mh-info">
                    <div className="mh-players">
                      {match.players?.map(p => (
                        <span key={p.username} className={`mh-player ${p.username === user ? 'mh-player-me' : ''}`}>
                          {p.username}
                          <span className="mh-player-score">{p.score}점</span>
                        </span>
                      ))}
                    </div>
                    <span className="mh-meta">
                      {match.mode === '1v1' ? '⚔️ 1:1' : '👥 그룹'} · {formatDate(match.timestamp)}
                    </span>
                  </div>
                  {match.mmrChanges && match.mmrChanges[user] !== undefined && (
                    <div className={`mh-mmr-change ${match.mmrChanges[user] > 0 ? 'mmr-up' : match.mmrChanges[user] < 0 ? 'mmr-down' : ''}`}>
                      {match.mmrChanges[user] > 0 ? '+' : ''}{match.mmrChanges[user]} MMR
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
