import { useState, useEffect, useCallback } from 'react'
import BattleRoom from './BattleRoom'

export default function BattlePage({ socket, user, onLoginPrompt }) {
  const [connected, setConnected] = useState(false)
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [createMode, setCreateMode] = useState('1v1')
  const [createCount, setCreateCount] = useState(10)
  const [createRanked, setCreateRanked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!socket) return

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    const onRoomList = (list) => setRooms(list)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('room-list', onRoomList)

    setConnected(socket.connected)

    socket.emit('get-rooms')

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('room-list', onRoomList)
    }
  }, [socket])

  const handleCreateRoom = useCallback(() => {
    if (!user) { onLoginPrompt(); return }
    if (!socket || !connected) {
      setError('서버에 연결 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setError('')
    socket.emit('create-room', {
      username: user,
      mode: createMode,
      questionCount: createCount,
      maxPlayers: createMode === '1v1' ? 2 : 8,
      ranked: createRanked,
    }, ({ roomId, error: err }) => {
      if (err) { setError(err); return }
      setCurrentRoom(roomId)
      setShowCreate(false)
    })
  }, [socket, connected, user, createMode, createCount, createRanked, onLoginPrompt])

  const handleJoinRoom = useCallback((roomId) => {
    if (!user) { onLoginPrompt(); return }
    if (!socket || !connected) {
      setError('서버에 연결 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setError('')
    socket.emit('join-room', { roomId, username: user }, ({ roomId: rid, error: err }) => {
      if (err) { setError(err); return }
      setCurrentRoom(rid)
    })
  }, [socket, connected, user, onLoginPrompt])

  const handleJoinByCode = useCallback(() => {
    if (!joinCode.trim()) return
    handleJoinRoom(joinCode.trim().toUpperCase())
    setJoinCode('')
  }, [joinCode, handleJoinRoom])

  const handleLeave = useCallback(() => {
    setCurrentRoom(null)
    if (socket) socket.emit('get-rooms')
  }, [socket])

  if (currentRoom) {
    return (
      <BattleRoom
        socket={socket}
        roomId={currentRoom}
        username={user}
        onLeave={handleLeave}
      />
    )
  }

  return (
    <div className="battle-page">
      <div className="battle-lobby-header">
        <h2 className="battle-lobby-title">⚔️ 온라인 경쟁</h2>
        <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
          <span className="status-dot" />
          {connected ? '서버 연결됨' : '연결 중...'}
        </div>
      </div>

      <div className="battle-actions">
        <button
          className="btn btn-create-room"
          onClick={() => {
            if (!user) { onLoginPrompt(); return }
            if (!connected) { setError('서버 연결을 기다려주세요.'); return }
            setError('')
            setShowCreate(true)
          }}
          disabled={!connected}
        >
          <span className="btn-icon">🎮</span>
          방 만들기
        </button>
        <div className="join-code-area">
          <input
            type="text"
            className="join-code-input"
            placeholder="초대 코드 입력"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
            maxLength={6}
          />
          <button className="btn btn-join-code" onClick={handleJoinByCode} disabled={!joinCode.trim() || !connected}>
            참가
          </button>
        </div>
      </div>

      {error && <p className="battle-error">{error}</p>}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content create-room-modal" onClick={e => e.stopPropagation()}>
            <button className="auth-close" onClick={() => setShowCreate(false)}>✕</button>
            <h3 className="create-room-title">🎮 방 만들기</h3>

            <div className="create-option">
              <label className="create-label">경쟁 모드</label>
              <div className="mode-selector">
                <button
                  className={`mode-btn ${createMode === '1v1' ? 'active' : ''}`}
                  onClick={() => setCreateMode('1v1')}
                >
                  <span className="mode-icon">⚔️</span>
                  <span className="mode-name">1:1 대전</span>
                  <span className="mode-desc">2명</span>
                </button>
                <button
                  className={`mode-btn ${createMode === 'group' ? 'active' : ''}`}
                  onClick={() => setCreateMode('group')}
                >
                  <span className="mode-icon">👥</span>
                  <span className="mode-name">그룹 경쟁</span>
                  <span className="mode-desc">최대 8명</span>
                </button>
              </div>
            </div>

            <div className="create-option">
              <label className="create-label">문제 수</label>
              <div className="count-selector">
                {[5, 10, 15, 20].map(c => (
                  <button
                    key={c}
                    className={`count-btn ${createCount === c ? 'active' : ''}`}
                    onClick={() => setCreateCount(c)}
                  >
                    {c}문제
                  </button>
                ))}
              </div>
            </div>

            {createMode === '1v1' && (
              <div className="create-option">
                <label className="create-label">랭크 모드</label>
                <div className="ranked-toggle">
                  <button
                    className={`ranked-toggle-btn ${!createRanked ? 'active' : ''}`}
                    onClick={() => setCreateRanked(false)}
                  >
                    <span className="ranked-toggle-icon">🎮</span>
                    일반
                  </button>
                  <button
                    className={`ranked-toggle-btn ${createRanked ? 'active' : ''}`}
                    onClick={() => setCreateRanked(true)}
                  >
                    <span className="ranked-toggle-icon">🏆</span>
                    랭크
                  </button>
                </div>
              </div>
            )}

            <button className="btn btn-start-game" onClick={handleCreateRoom}>
              방 만들기
            </button>
          </div>
        </div>
      )}

      <div className="room-list-section">
        <h3 className="room-list-title">
          📋 대기 중인 방 ({rooms.length}개)
        </h3>
        {rooms.length === 0 ? (
          <div className="room-list-empty">
            <span className="empty-emoji">🏠</span>
            <p>아직 만들어진 방이 없습니다.</p>
            <p className="ranking-empty-sub">첫 번째 방을 만들어보세요!</p>
          </div>
        ) : (
          <div className="room-list">
            {rooms.map(room => (
              <div key={room.id} className="room-item">
                <div className="room-item-info">
                  <div className="room-item-top">
                    <span className="room-item-mode">
                      {room.mode === '1v1' ? '⚔️ 1:1' : '👥 그룹'}
                    </span>
                    {room.ranked && <span className="room-item-ranked">🏆 랭크</span>}
                    <span className="room-item-id">{room.id}</span>
                  </div>
                  <p className="room-item-host">👑 {room.host}</p>
                  <p className="room-item-detail">{room.questionCount}문제</p>
                </div>
                <div className="room-item-action">
                  <span className="room-player-count">
                    {room.playerCount}/{room.maxPlayers}
                  </span>
                  <button
                    className="btn btn-join-room"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.playerCount >= room.maxPlayers || !connected}
                  >
                    참가
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
