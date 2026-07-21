import { useMemo } from 'react'

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

export default function RankingPage({ jokeRankings, currentUser }) {
  const users = useMemo(() => {
    const raw = getUsers()
    return Object.entries(raw)
      .map(([name, data]) => ({
        username: name,
        points: data.points || 0,
        correctCount: data.correctCount || 0,
      }))
      .sort((a, b) => b.points - a.points || b.correctCount - a.correctCount)
  }, [])

  const jokeTop = useMemo(() => {
    return jokeRankings.slice(0, 20)
  }, [jokeRankings])

  const hasJokeRankings = jokeTop.length > 0 && jokeTop.some(j => j.likes > 0)
  const hasUserRankings = users.length > 0 && users.some(u => u.points > 0)

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
            <p>아직 포인트가 있는 유저가 없습니다.</p>
            <p className="ranking-empty-sub">로그인하고 퀴즈를 풀어 포인트를 모아보세요!</p>
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
                      {user.username}
                      {isMe && <span className="me-badge">나</span>}
                    </p>
                    <p className="ranking-stats">
                      정답 <strong>{user.correctCount}</strong>개
                    </p>
                  </div>
                  <div className="ranking-score">
                    <span className="ranking-points-icon">⭐</span>
                    <span className="ranking-score-value">{user.points.toLocaleString()}</span>
                    <span className="ranking-points-label">P</span>
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
