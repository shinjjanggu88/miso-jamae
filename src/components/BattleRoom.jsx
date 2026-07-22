import { useState, useEffect, useCallback, useRef } from 'react'

function normalize(str) {
  return str.replace(/\s+/g, '').toLowerCase()
}

export default function BattleRoom({ socket, roomId, username, onLeave }) {
  const [phase, setPhase] = useState('waiting')
  const [players, setPlayers] = useState([])
  const [host, setHost] = useState('')
  const [question, setQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [userInput, setUserInput] = useState('')
  const [myScore, setMyScore] = useState(0)
  const [scores, setScores] = useState({})
  const [answeredPlayers, setAnsweredPlayers] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [lastResult, setLastResult] = useState(null)
  const [gameResults, setGameResults] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [isRanked, setIsRanked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef(null)

  const isHost = host === username

  useEffect(() => {
    if (!socket) return

    socket.on('player-joined', ({ players: p, host: h }) => {
      setPlayers(p)
      setHost(h)
    })

    socket.on('player-left', ({ username: leftUser, players: p, host: h }) => {
      setPlayers(p)
      setHost(h)
    })

    socket.on('question', ({ index, total, quiz, timeLimit }) => {
      setPhase('playing')
      setQuestion({ quiz })
      setQuestionIndex(index)
      setTotalQuestions(total)
      setTimeLeft(timeLimit)
      setUserInput('')
      setLastResult(null)
      setSubmitted(false)
      setAnsweredPlayers(0)
    })

    socket.on('timer-tick', (t) => {
      setTimeLeft(t)
    })

    socket.on('time-up', ({ answer, scores: s }) => {
      setLastResult({ answer, isTimeout: true })
      setScores(s)
      setSubmitted(true)
    })

    socket.on('player-answered', ({ answeredCount, totalPlayers: tp }) => {
      setAnsweredPlayers(answeredCount)
      setTotalPlayers(tp)
    })

    socket.on('game-over', ({ results, match, ranked }) => {
      setPhase('results')
      setGameResults(results)
      setMatchData(match)
      setIsRanked(ranked || false)
    })

    return () => {
      socket.off('player-joined')
      socket.off('player-left')
      socket.off('question')
      socket.off('timer-tick')
      socket.off('time-up')
      socket.off('player-answered')
      socket.off('game-over')
    }
  }, [socket])

  useEffect(() => {
    if (phase === 'playing' && !submitted && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [phase, submitted, questionIndex])

  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || submitted) return
    socket.emit('submit-answer', { roomId, answer: userInput.trim() }, ({ isCorrect }) => {
      setSubmitted(true)
      setLastResult({ isCorrect, isTimeout: false })
    })
  }, [userInput, submitted, socket, roomId])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !submitted) handleSubmit()
  }, [handleSubmit, submitted])

  const handleStartGame = useCallback(() => {
    socket.emit('start-game', { roomId }, ({ error }) => {
      if (error) alert(error)
    })
  }, [socket, roomId])

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [roomId])

  const handleBackToLobby = useCallback(() => {
    socket.emit('leave-room')
    onLeave()
  }, [socket, onLeave])

  const timerPercent = (timeLeft / 15) * 100
  const timerColor = timeLeft > 10 ? '#4ecdc4' : timeLeft > 5 ? '#ffd700' : '#ff6b6b'

  if (phase === 'waiting') {
    return (
      <div className="battle-room">
        <div className="battle-room-header">
          <button className="btn-back" onClick={handleBackToLobby}>← 나가기</button>
          <h2 className="battle-room-title">⚔️ 대기실</h2>
        </div>

        <div className="room-code-section">
          <p className="room-code-label">초대 코드</p>
          <div className="room-code-display">
            <span className="room-code">{roomId}</span>
            <button className="btn-copy-code" onClick={handleCopyCode}>
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
          <p className="room-code-hint">위 코드를 친구에게 공유하세요!</p>
        </div>

        <div className="players-section">
          <h3 className="players-title">참여한 플레이어 ({players.length}명)</h3>
          <div className="players-list">
            {players.map((p, i) => (
              <div key={p} className={`player-item ${p === host ? 'is-host' : ''} ${p === username ? 'is-me' : ''}`}>
                <span className="player-avatar">{p === host ? '👑' : '👤'}</span>
                <span className="player-name">{p}{p === username && ' (나)'}</span>
                {p === host && <span className="host-badge">방장</span>}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            className="btn btn-start-game"
            onClick={handleStartGame}
            disabled={players.length < 2}
          >
            {players.length < 2 ? '대기 중... (최소 2명)' : '🎮 게임 시작!'}
          </button>
        ) : (
          <p className="waiting-msg">방장이 게임을 시작하기를 기다리는 중...</p>
        )}
      </div>
    )
  }

  if (phase === 'results') {
    const myResult = gameResults?.find(r => r.username === username)
    const myRank = gameResults?.findIndex(r => r.username === username) + 1

    return (
      <div className="battle-room">
        <div className="battle-room-header">
          <button className="btn-back" onClick={handleBackToLobby}>← 로비로</button>
          <h2 className="battle-room-title">🏆 게임 결과</h2>
        </div>

        {myResult && (
          <div className="my-result-card">
            <div className="result-rank-badge">
              {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : `#${myRank}`}
            </div>
            <p className="result-rank-text">
              {myRank === 1 ? '우승입니다!' : `${myRank}위`}
            </p>
            {isRanked && (
              <div className={`result-ranked-badge ${matchData?.winner === username ? 'result-win' : matchData?.result === 'draw' ? 'result-draw' : 'result-lose'}`}>
                {isRanked ? '🏆 랭크 매치' : ''}
              </div>
            )}
            <p className="result-score-big">{myResult.score}점</p>
            <div className="result-details">
              <span>정답 {myResult.correctCount}개</span>
              <span>평균 {myResult.avgTime}초</span>
            </div>
            {isRanked && matchData?.mmrChanges?.[username] !== undefined && (
              <div className={`result-mmr-change ${matchData.mmrChanges[username] > 0 ? 'mmr-up' : matchData.mmrChanges[username] < 0 ? 'mmr-down' : ''}`}>
                MMR {matchData.mmrChanges[username] > 0 ? '+' : ''}{matchData.mmrChanges[username]}
              </div>
            )}
          </div>
        )}

        <div className="results-list">
          <h3 className="results-title">전체 순위</h3>
          {gameResults?.map((r, i) => (
            <div key={r.username} className={`result-item ${r.username === username ? 'is-me' : ''}`}>
              <span className="result-rank">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}위`}
              </span>
              <span className="result-name">{r.username}</span>
              <span className="result-score">{r.score}점</span>
              <span className="result-correct">{r.correctCount}정답</span>
            </div>
          ))}
        </div>

        <button className="btn btn-start-game" onClick={handleBackToLobby}>
          로비로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="battle-room">
      <div className="battle-ingame-header">
        <div className="battle-progress-info">
          <span className="battle-q-num">{questionIndex + 1} / {totalQuestions}</span>
        </div>
        <div className="battle-timer-bar">
          <div
            className="battle-timer-fill"
            style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
          />
        </div>
        <div className="battle-timer-text" style={{ color: timerColor }}>
          {timeLeft}초
        </div>
      </div>

      <div className="battle-scores-bar">
        {players.map(p => (
          <div key={p} className={`battle-score-chip ${p === username ? 'is-me' : ''}`}>
            <span className="chip-name">{p}</span>
            <span className="chip-score">{scores[p] || 0}P</span>
          </div>
        ))}
      </div>

      <div className="battle-question-area">
        <div className="battle-question-card">
          <span className="battle-q-badge">Q</span>
          <p className="battle-q-text">{question?.quiz}</p>
        </div>
      </div>

      {!submitted ? (
        <div className="battle-answer-area">
          <input
            ref={inputRef}
            type="text"
            className="battle-answer-input"
            placeholder="정답을 입력하세요!"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            className="btn btn-submit"
            onClick={handleSubmit}
            disabled={!userInput.trim()}
          >
            ✅ 제출
          </button>
        </div>
      ) : (
        <div className={`battle-result-reveal ${lastResult?.isTimeout ? 'timeout' : lastResult?.isCorrect ? 'correct' : 'wrong'}`}>
          {lastResult?.isTimeout ? (
            <>
              <span className="reveal-emoji">⏰</span>
              <p className="reveal-text">시간 초과!</p>
              <p className="reveal-answer">정답: <strong>{lastResult.answer}</strong></p>
            </>
          ) : lastResult?.isCorrect ? (
            <>
              <span className="reveal-emoji">✅</span>
              <p className="reveal-text correct-text">정답!</p>
            </>
          ) : (
            <>
              <span className="reveal-emoji">❌</span>
              <p className="reveal-text wrong-text">오답!</p>
              <p className="reveal-answer">정답: <strong>{lastResult?.answer || '...'}</strong></p>
            </>
          )}
          <div className="battle-answered-status">
            {answeredPlayers}/{totalPlayers} 명 답변 완료
          </div>
        </div>
      )}
    </div>
  )
}
