import { useState, useRef, useEffect, useCallback } from 'react'

function normalize(str) {
  return str.replace(/\s+/g, '').toLowerCase()
}

const CONFETTI_COLORS = [
  '#6c63ff', '#ff6b6b', '#ffd700', '#4ecdc4', '#ff69b4',
  '#ff9a3c', '#a855f7', '#22d3ee', '#f43f5e', '#84cc16'
]

const CELEBRATION_EMOJIS = ['🎉', '🎊', '🥳', '✨', '💫', '🎆', '🎇', '🪅', '🥂', '🏆']

function Confetti({ active }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) { setPieces([]); return }
    const newPieces = []
    for (let i = 0; i < 80; i++) {
      const type = ['square', 'circle', 'strip'][Math.floor(Math.random() * 3)]
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      newPieces.push({
        id: i, type, color,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 2,
        size: 6 + Math.random() * 10,
      })
    }
    setPieces(newPieces)
    const timer = setTimeout(() => setPieces([]), 4000)
    return () => clearTimeout(timer)
  }, [active])

  if (pieces.length === 0) return null
  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className={`confetti-piece ${p.type}`}
          style={{
            left: `${p.left}%`, top: '-20px',
            width: p.type === 'strip' ? 6 : p.size,
            height: p.type === 'strip' ? 18 : p.size,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  )
}

function EmojiBurst({ active }) {
  const [emojis, setEmojis] = useState([])

  useEffect(() => {
    if (!active) { setEmojis([]); return }
    const newEmojis = []
    for (let i = 0; i < 14; i++) {
      const emoji = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)]
      const angle = (Math.PI * 2 * i) / 14
      const distance = 100 + Math.random() * 160
      newEmojis.push({
        id: i, emoji,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance - 80,
        rot: -360 + Math.random() * 720,
        delay: Math.random() * 0.3,
      })
    }
    setEmojis(newEmojis)
    const timer = setTimeout(() => setEmojis([]), 2000)
    return () => clearTimeout(timer)
  }, [active])

  if (emojis.length === 0) return null
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 1001, pointerEvents: 'none' }}>
      {emojis.map(e => (
        <span
          key={e.id}
          className="emoji-burst"
          style={{
            '--tx': `${e.tx}px`, '--ty': `${e.ty}px`, '--rot': `${e.rot}deg`,
            animationDelay: `${e.delay}s`,
          }}
        >{e.emoji}</span>
      ))}
    </div>
  )
}

export default function JokeCard({
  joke, showAnswer, onReveal, onCheckAnswer, onNext, onLike, onShare,
  isLiked, likeCount, user, onLoginPrompt, streak
}) {
  const [flipping, setFlipping] = useState(false)
  const [displayAnswer, setDisplayAnswer] = useState('')
  const [answerAnimating, setAnswerAnimating] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [modal, setModal] = useState(null)
  const [confetti, setConfetti] = useState(false)
  const [emojiBurst, setEmojiBurst] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const cardRef = useRef(null)
  const inputRef = useRef(null)

  const handleModalClose = useCallback(() => {
    const wasCorrect = modal === 'correct'
    setModal(null)
    setConfetti(false)
    setEmojiBurst(false)
    setEarnedPoints(0)
    onCheckAnswer(wasCorrect)
    setUserInput('')
  }, [modal, onCheckAnswer])

  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || showAnswer) return
    const isCorrect = joke.answer
      .split(',')
      .some(a => normalize(a) === normalize(userInput))
    if (isCorrect) {
      setConfetti(true)
      setEmojiBurst(true)
      const newStreak = (streak || 0) + 1
      const pts = 10 + (newStreak > 1 ? (newStreak - 1) * 5 : 0)
      setEarnedPoints(user ? pts : 0)
    } else {
      setEarnedPoints(0)
    }
    setModal(isCorrect ? 'correct' : 'wrong')
  }, [userInput, joke, showAnswer, streak, user])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (modal) {
        handleModalClose()
      } else if (showAnswer) {
        onNext()
      } else {
        handleSubmit()
      }
    }
  }, [handleSubmit, handleModalClose, onNext, modal, showAnswer])

  useEffect(() => {
    if (showAnswer && joke) {
      setAnswerAnimating(true)
      const fullAnswer = joke.answer
      let idx = 0
      setDisplayAnswer('')
      const interval = setInterval(() => {
        idx++
        setDisplayAnswer(fullAnswer.slice(0, idx))
        if (idx >= fullAnswer.length) {
          clearInterval(interval)
          setTimeout(() => setAnswerAnimating(false), 400)
        }
      }, 80)
      return () => clearInterval(interval)
    } else {
      setDisplayAnswer('')
      setAnswerAnimating(false)
    }
  }, [showAnswer, joke])

  useEffect(() => {
    if (cardRef.current) {
      setFlipping(true)
      setTimeout(() => setFlipping(false), 500)
    }
    setUserInput('')
    setModal(null)
    setConfetti(false)
    setEmojiBurst(false)
    setEarnedPoints(0)
  }, [joke?.id])

  useEffect(() => {
    if (!showAnswer && !modal && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 600)
    }
  }, [showAnswer, modal, joke?.id])

  useEffect(() => {
    if (modal) {
      const handler = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          handleModalClose()
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }
  }, [modal, handleModalClose])

  useEffect(() => {
    if (showAnswer && !modal) {
      const handler = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onNext()
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }
  }, [showAnswer, modal, onNext])

  if (!joke) return null

  return (
    <div className="card-container">
      <Confetti active={confetti && modal === 'correct'} />
      <EmojiBurst active={emojiBurst && modal === 'correct'} />

      <div className={`joke-card ${flipping ? 'card-flip' : ''}`} ref={cardRef}>
        <div className="card-decoration top-left"></div>
        <div className="card-decoration top-right"></div>
        <div className="card-decoration bottom-left"></div>
        <div className="card-decoration bottom-right"></div>

        <div className="card-badge">Q</div>

        <div className="card-question">
          <p>{joke.quiz}</p>
        </div>

        {!showAnswer && !modal && (
          <div className="answer-input-area">
            <div className="input-wrapper">
              <span className="input-label">정답 입력</span>
              <input
                ref={inputRef}
                type="text"
                className="answer-input"
                placeholder="정답을 입력하고 엔터를 누르세요!"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <div className="input-actions">
              <button className="btn btn-submit" onClick={handleSubmit} disabled={!userInput.trim()}>
                <span className="btn-icon">✅</span>
                정답 제출
              </button>
              <button className="btn btn-giveup" onClick={onReveal}>
                <span className="btn-icon">👀</span>
                포기하고 정답 보기
              </button>
            </div>
          </div>
        )}

        <div className={`card-answer ${showAnswer ? 'revealed' : 'hidden'}`}>
          <div className="answer-divider">
            <span className="divider-line"></span>
            <span className="divider-text">정답</span>
            <span className="divider-line"></span>
          </div>
          <div className={`answer-text ${answerAnimating ? 'typing' : ''}`}>
            <span className="answer-badge">A</span>
            <p>{displayAnswer}</p>
          </div>
          {showAnswer && (
            <div className="answer-reaction">
              <span className="reaction-emoji">ㅋ</span>
              <span className="reaction-text">ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ</span>
            </div>
          )}
        </div>

        {showAnswer && (
          <div className="card-actions">
            <button className="btn btn-next" onClick={onNext}>
              <span className="btn-icon">🎲</span>
              다음 문제
            </button>
          </div>
        )}

        <div className="card-footer-actions">
          <button
            className={`btn-like ${isLiked ? 'liked' : ''}`}
            onClick={() => onLike(joke.id)}
          >
            <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
            {likeCount > 0 && <span className="like-count">{likeCount}</span>}
          </button>
          <button className="btn-share" onClick={() => onShare(joke)}>
            <span>🔗</span>
            공유
          </button>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className={`modal-content ${modal === 'correct' ? 'modal-correct' : 'modal-wrong'}`} onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              {modal === 'correct' ? '🎉' : '😭'}
            </div>
            <h2 className="modal-title">
              {modal === 'correct' ? '맞혔습니다!' : '틀렸습니다!'}
            </h2>
            {modal === 'correct' && earnedPoints > 0 && (
              <p className="modal-points">+{earnedPoints}P 획득!</p>
            )}
            {modal === 'correct' && (
              <p className="modal-compliment">ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ 대박이네요!</p>
            )}
            {modal === 'wrong' && (
              <p className="modal-correct-answer">
                정답은 <strong>{joke.answer}</strong> 입니다
              </p>
            )}
            <div className="modal-btn-wrapper">
              <button className="btn modal-close-btn" onClick={handleModalClose}>
                {modal === 'correct' ? '다음 문제로' : '알겠어요'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
