import { useState, useEffect, useCallback } from 'react'
import JokeCard from './components/JokeCard'
import JokeList from './components/JokeList'
import AuthModal from './components/AuthModal'
import RankingPage from './components/RankingPage'

const API_URL = 'https://raw.githubusercontent.com/Team-WAVE-x/Stop-uncle/master/src/ajegag.json'

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('geguejjang-session') || 'null')
  } catch { return null }
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('geguejjang-users') || '{}')
  } catch { return {} }
}

function saveUsers(users) {
  localStorage.setItem('geguejjang-users', JSON.stringify(users))
}

function getUserLikesKey(username) {
  return `geguejjang-likes-${username}`
}

function getUserLikes(username) {
  try {
    return JSON.parse(localStorage.getItem(getUserLikesKey(username)) || '{}')
  } catch { return {} }
}

export default function App() {
  const [jokes, setJokes] = useState([])
  const [currentJoke, setCurrentJoke] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('card')
  const [revealedJokes, setRevealedJokes] = useState(new Set())
  const [streak, setStreak] = useState(0)

  const [user, setUser] = useState(() => {
    const s = getSession()
    if (s && getUsers()[s.username]) return s.username
    return null
  })
  const [showAuth, setShowAuth] = useState(false)
  const [points, setPoints] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)

  const [globalLikeCount, setGlobalLikeCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem('joke-like-counts') || '{}') } catch { return {} }
  })
  const [userLikes, setUserLikes] = useState(() => ({}))

  useEffect(() => {
    if (user) {
      setUserLikes(getUserLikes(user))
      const users = getUsers()
      const u = users[user]
      if (u) {
        setPoints(u.points || 0)
        setCorrectCount(u.correctCount || 0)
      }
      setWrongCount(() => {
        try { return parseInt(localStorage.getItem(`geguejjang-wrong-${user}`) || '0') } catch { return 0 }
      })
    } else {
      setUserLikes({})
      setPoints(0)
      setCorrectCount(0)
      setWrongCount(0)
    }
  }, [user])

  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('API 응답 오류')
        return res.json()
      })
      .then(data => {
        const problems = data.problems || []
        const unique = []
        const seen = new Set()
        for (const p of problems) {
          const key = p.quiz
          if (!seen.has(key)) {
            seen.add(key)
            unique.push({
              id: unique.length,
              quiz: p.quiz,
              answer: p.answer[0] || ''
            })
          }
        }
        setJokes(unique)
        setLoading(false)
        if (unique.length > 0) {
          setCurrentJoke(unique[Math.floor(Math.random() * unique.length)])
        }
      })
      .catch(() => {
        setError('아재개그를 불러오지 못했습니다. 네트워크를 확인해주세요.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    localStorage.setItem('joke-like-counts', JSON.stringify(globalLikeCount))
  }, [globalLikeCount])

  const login = useCallback((username) => {
    localStorage.setItem('geguejjang-session', JSON.stringify({ username }))
    setUser(username)
    setShowAuth(false)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('geguejjang-session')
    setUser(null)
    setStreak(0)
  }, [])

  const getRandomJoke = useCallback(() => {
    if (jokes.length === 0) return
    setShowAnswer(false)
    setRevealedJokes(prev => {
      if (prev.size >= jokes.length) return new Set()
      return prev
    })
    let next
    let attempts = 0
    do {
      next = jokes[Math.floor(Math.random() * jokes.length)]
      attempts++
    } while (revealedJokes.has(next.id) && attempts < 50)
    setCurrentJoke(next)
  }, [jokes, revealedJokes])

  const toggleLike = useCallback((jokeId) => {
    if (!user) {
      setShowAuth(true)
      return
    }
    setUserLikes(prev => {
      const next = { ...prev }
      const wasLiked = !!next[jokeId]
      if (wasLiked) delete next[jokeId]
      else next[jokeId] = true
      localStorage.setItem(getUserLikesKey(user), JSON.stringify(next))
      setGlobalLikeCount(gc => {
        const updated = { ...gc }
        updated[jokeId] = (updated[jokeId] || 0) + (wasLiked ? -1 : 1)
        if (updated[jokeId] <= 0) delete updated[jokeId]
        return updated
      })
      if (!wasLiked) {
        const users = getUsers()
        if (users[user]) {
          users[user].points = (users[user].points || 0) + 1
          saveUsers(users)
          setPoints(users[user].points)
        }
      }
      return next
    })
  }, [user])

  const shareJoke = useCallback((joke) => {
    const text = `개그지왕 문제: ${joke.quiz}\n정답: ${joke.answer}\n\n개그지왕에서 더 만나보세요!`
    if (navigator.share) {
      navigator.share({ title: '개그지왕', text }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('클립보드에 복사되었습니다!')
      })
    }
  }, [])

  const handleReveal = useCallback(() => {
    setShowAnswer(true)
    setStreak(s => s + 1)
    if (currentJoke) {
      setRevealedJokes(prev => new Set([...prev, currentJoke.id]))
    }
  }, [currentJoke])

  const handleCheckAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      const newStreak = streak + 1
      setCorrectCount(c => c + 1)
      setStreak(newStreak)
      if (user) {
        const bonus = 10 + (newStreak > 1 ? (newStreak - 1) * 5 : 0)
        const users = getUsers()
        if (users[user]) {
          users[user].points = (users[user].points || 0) + bonus
          users[user].correctCount = (users[user].correctCount || 0) + 1
          saveUsers(users)
          setPoints(users[user].points)
          setCorrectCount(users[user].correctCount)
        }
      }
    } else {
      setWrongCount(w => w + 1)
      setStreak(0)
      if (user) {
        localStorage.setItem(`geguejjang-wrong-${user}`, String(wrongCount + 1))
      }
    }
    setShowAnswer(true)
    if (currentJoke) {
      setRevealedJokes(prev => new Set([...prev, currentJoke.id]))
    }
  }, [currentJoke, user, streak, wrongCount])

  const jokeRankings = jokes.map(j => ({
    ...j,
    likes: globalLikeCount[j.id] || 0,
  })).sort((a, b) => b.likes - a.likes)

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
        <p>개그지왕 로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-error">
        <span className="error-emoji">😢</span>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <h1 className="app-title" onClick={() => { setView('card'); getRandomJoke(); }}>
              <span className="title-emoji">개그지왕</span>
              <span className="title-sub">KING of JOKES</span>
            </h1>
            <div className="user-area">
              {user ? (
                <div className="user-info">
                  <span className="user-points">⭐ {points.toLocaleString()}P</span>
                  <span className="user-name">👤 {user}</span>
                  <button className="btn-logout" onClick={logout}>로그아웃</button>
                </div>
              ) : (
                <button className="btn-login" onClick={() => setShowAuth(true)}>
                  로그인 / 회원가입
                </button>
              )}
            </div>
          </div>
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${view === 'card' ? 'active' : ''}`}
              onClick={() => setView('card')}
            >
              🎲 랜덤
            </button>
            <button
              className={`nav-tab ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              📋 전체 목록
            </button>
            <button
              className={`nav-tab ${view === 'ranking' ? 'active' : ''}`}
              onClick={() => setView('ranking')}
            >
              🏆 순위
            </button>
          </nav>
          <div className="stats-bar">
            <span className="stat">
              총 <strong>{jokes.length}</strong>개
            </span>
            <span className="stat stat-correct">
              <span className="stat-dot correct"></span>
              정답 <strong>{correctCount}</strong>
            </span>
            <span className="stat stat-wrong">
              <span className="stat-dot wrong"></span>
              오답 <strong>{wrongCount}</strong>
            </span>
            {user && (
              <span className="stat stat-points-badge">
                ⭐ {points.toLocaleString()}P
              </span>
            )}
            {streak > 1 && (
              <span className="stat streak-badge">
                🔥 {streak}연속
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {view === 'card' && (
          <JokeCard
            joke={currentJoke}
            showAnswer={showAnswer}
            onReveal={handleReveal}
            onCheckAnswer={handleCheckAnswer}
            onNext={getRandomJoke}
            onLike={toggleLike}
            onShare={shareJoke}
            isLiked={currentJoke ? !!userLikes[currentJoke.id] : false}
            likeCount={currentJoke ? (globalLikeCount[currentJoke.id] || 0) : 0}
            user={user}
            onLoginPrompt={() => setShowAuth(true)}
            streak={streak}
          />
        )}
        {view === 'list' && (
          <JokeList
            jokes={jokes}
            userLikes={userLikes}
            likeCount={globalLikeCount}
            onLike={toggleLike}
            onShare={shareJoke}
            user={user}
            onLoginPrompt={() => setShowAuth(true)}
          />
        )}
        {view === 'ranking' && (
          <RankingPage
            jokeRankings={jokeRankings}
            currentUser={user}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>개그지왕 - 웃음은 건강의 지름길</p>
      </footer>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={login}
        />
      )}
    </div>
  )
}
