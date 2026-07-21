import { useState } from 'react'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('geguejjang-users') || '{}')
  } catch { return {} }
}

function saveUsers(users) {
  localStorage.setItem('geguejjang-users', JSON.stringify(users))
}

export default function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const trimmed = username.trim()
    if (!trimmed || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }
    if (trimmed.length < 2) {
      setError('아이디는 2자 이상이어야 합니다.')
      return
    }
    if (password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다.')
      return
    }

    const users = getUsers()

    if (mode === 'signup') {
      if (users[trimmed]) {
        setError('이미 존재하는 아이디입니다.')
        return
      }
      users[trimmed] = {
        password,
        points: 0,
        correctCount: 0,
        createdAt: new Date().toISOString()
      }
      saveUsers(users)
      onLogin(trimmed)
    } else {
      if (!users[trimmed] || users[trimmed].password !== password) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        return
      }
      onLogin(trimmed)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="auth-logo">
          <span className="auth-logo-icon">👑</span>
          <h2 className="auth-title">개그지왕</h2>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
          >
            로그인
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError('') }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>아이디</label>
            <input
              type="text"
              placeholder="아이디 입력"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn auth-submit">
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <p className="auth-hint">
          {mode === 'login'
            ? '계정이 없으시면 회원가입을 해주세요!'
            : '간단한 회원가입으로 포인트를 모아보세요!'}
        </p>
      </div>
    </div>
  )
}
