import { useState, useMemo } from 'react'

export default function JokeList({ jokes, userLikes, likeCount, onLike, onShare, user, onLoginPrompt }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('id')

  const filtered = useMemo(() => {
    let result = jokes
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(j =>
        j.quiz.toLowerCase().includes(q) ||
        j.answer.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'likes') {
      result = [...result].sort((a, b) => (likeCount[b.id] || 0) - (likeCount[a.id] || 0))
    }
    return result
  }, [jokes, search, sortBy, likeCount])

  const handleLike = (jokeId) => {
    if (!user) {
      onLoginPrompt()
      return
    }
    onLike(jokeId)
  }

  return (
    <div className="joke-list-container">
      <div className="list-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="검색어를 입력하세요 (질문 또는 정답)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>
        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortBy === 'id' ? 'active' : ''}`}
            onClick={() => setSortBy('id')}
          >
            최신순
          </button>
          <button
            className={`sort-btn ${sortBy === 'likes' ? 'active' : ''}`}
            onClick={() => setSortBy('likes')}
          >
            인기순
          </button>
        </div>
      </div>

      <p className="result-count">
        {search ? `"${search}" 검색 결과 ` : ''}{filtered.length}개의 아재개그
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">🔍</span>
          <p>검색 결과가 없습니다</p>
          <button className="btn-reset-search" onClick={() => setSearch('')}>
            검색 초기화
          </button>
        </div>
      ) : (
        <div className="joke-grid">
          {filtered.map(joke => (
            <div key={joke.id} className="joke-list-item">
              <div className="item-content">
                <span className="item-number">#{joke.id + 1}</span>
                <p className="item-question">{joke.quiz}</p>
                <p className="item-answer">
                  <span className="answer-label">정답:</span> {joke.answer}
                </p>
              </div>
              <div className="item-actions">
                <button
                  className={`btn-like-small ${userLikes[joke.id] ? 'liked' : ''}`}
                  onClick={() => handleLike(joke.id)}
                >
                  {userLikes[joke.id] ? '❤️' : '🤍'}
                  {(likeCount[joke.id] || 0) > 0 && (
                    <span className="like-count-small">{likeCount[joke.id]}</span>
                  )}
                </button>
                <button className="btn-share-small" onClick={() => onShare(joke)}>
                  🔗
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
