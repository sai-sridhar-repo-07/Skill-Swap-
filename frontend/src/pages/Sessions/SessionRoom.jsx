import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Hand, PhoneOff, Users, Send, Pencil,
  Eraser, X, Play,
} from 'lucide-react'
import { getSocket } from '../../hooks/useSocket'
import { sessionService } from '../../services/sessionService'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../../components/ui/Avatar'
import toast from 'react-hot-toast'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function SessionRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Media
  const [audioEnabled, setAudioEnabled]   = useState(true)
  const [videoEnabled, setVideoEnabled]   = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [handRaised, setHandRaised]       = useState(false)
  const [remoteStreams, setRemoteStreams]  = useState({})
  const localStreamRef = useRef(null)
  const localVideoRef  = useRef()

  // UI
  const [sidePanel, setSidePanel]       = useState(null) // 'chat' | 'participants' | 'whiteboard'
  const [messages, setMessages]         = useState([])
  const [msgInput, setMsgInput]         = useState('')
  const [participants, setParticipants] = useState([])
  const [raisedHands, setRaisedHands]   = useState([])
  const [elapsed, setElapsed]           = useState(0)
  const [unreadCount, setUnreadCount]   = useState(0)
  const chatEndRef = useRef()

  // Whiteboard
  const [drawing, setDrawing]     = useState(false)
  const [drawColor, setDrawColor] = useState('#FF6B00')
  const [drawSize]                = useState(3)
  const [tool, setTool]           = useState('pen')
  const canvasRef  = useRef()
  const lastPosRef = useRef()

  // WebRTC
  const peerConnections = useRef({})

  const { data, refetch } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionService.getById(id),
    refetchInterval: 15000,
  })
  const session = data?.data?.data?.session
  const isHost  = session?.hostId?._id === user?._id || session?.hostId === user?._id
  const isLive  = session?.status === 'live'

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Camera / mic init
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      })
      .catch(() => toast.error('Camera/microphone access denied'))
    return () => localStreamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  // Create WebRTC peer connection
  const createPeerConnection = useCallback((remoteId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    peerConnections.current[remoteId] = pc

    const stream = localStreamRef.current
    if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream))

    pc.ontrack = (e) => setRemoteStreams((s) => ({ ...s, [remoteId]: e.streams[0] }))
    pc.onicecandidate = (e) => {
      if (e.candidate) getSocket()?.emit('ice-candidate', { roomId: id, candidate: e.candidate, targetId: remoteId })
    }
    return pc
  }, [id])

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Count unread when chat is closed
  useEffect(() => {
    if (sidePanel === 'chat') { setUnreadCount(0); return }
    setUnreadCount((c) => c + (messages.length > 0 ? 1 : 0))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // Socket setup
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !id) return

    socket.emit('join-room', { roomId: id })
    toast('You joined the room 🚀', { duration: 3000 })

    socket.on('user-joined', ({ userId, name, avatar }) => {
      setParticipants((p) => [...p.filter((x) => x.userId !== userId), { userId, name, avatar }])
      toast(`${name} joined`, { icon: '👋', duration: 3000 })

      // Initiate WebRTC offer to the new joiner
      const stream = localStreamRef.current
      if (stream) {
        const pc = createPeerConnection(userId)
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer)
            .then(() => socket.emit('offer', { roomId: id, offer, targetId: userId })))
          .catch(() => {})
      }
    })

    socket.on('user-left', ({ userId }) => {
      setParticipants((p) => p.filter((x) => x.userId !== userId))
      setRemoteStreams((s) => { const n = { ...s }; delete n[userId]; return n })
      peerConnections.current[userId]?.close()
      delete peerConnections.current[userId]
    })

    socket.on('chat-message', (msg) => setMessages((m) => [...m, msg]))

    socket.on('hand-raised', ({ userId, name }) => {
      setRaisedHands((h) => [...h.filter((x) => x !== userId), userId])
      toast(`${name} raised their hand ✋`, { duration: 3000 })
    })
    socket.on('hand-lowered', ({ userId }) => setRaisedHands((h) => h.filter((x) => x !== userId)))

    socket.on('session-ended', () => {
      toast.error('Session ended by host')
      setTimeout(() => navigate(`/sessions/${id}`), 2000)
    })
    socket.on('removed-from-room', ({ reason }) => {
      toast.error(reason)
      navigate(`/sessions/${id}`)
    })

    // WebRTC signaling
    socket.on('offer', async ({ offer, from }) => {
      const pc = createPeerConnection(from)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('answer', { roomId: id, answer, targetId: from })
    })
    socket.on('answer', async ({ answer, from }) => {
      const pc = peerConnections.current[from]
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer))
    })
    socket.on('ice-candidate', async ({ candidate, from }) => {
      const pc = peerConnections.current[from]
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {})
    })

    // Whiteboard
    socket.on('whiteboard-draw', (data) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.strokeStyle = data.color
      ctx.lineWidth   = data.size
      ctx.lineCap     = 'round'
      ctx.moveTo(data.x1, data.y1)
      ctx.lineTo(data.x2, data.y2)
      ctx.stroke()
    })
    socket.on('whiteboard-clear', () => {
      const canvas = canvasRef.current
      if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    })

    return () => {
      socket.emit('leave-room', { roomId: id })
      ;['user-joined','user-left','chat-message','hand-raised','hand-lowered',
        'session-ended','removed-from-room','offer','answer','ice-candidate',
        'whiteboard-draw','whiteboard-clear'].forEach((e) => socket.off(e))
      Object.values(peerConnections.current).forEach((pc) => pc.close())
    }
  }, [id, createPeerConnection, navigate])

  // ─── Controls ────────────────────────────────────────────────────────────

  const toggleAudio = () => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getAudioTracks().forEach((t) => { t.enabled = !t.enabled })
    setAudioEnabled((v) => !v)
  }

  const toggleVideo = () => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getVideoTracks().forEach((t) => { t.enabled = !t.enabled })
    setVideoEnabled((v) => !v)
  }

  const toggleScreenShare = async () => {
    if (screenSharing) {
      localStreamRef.current?.getVideoTracks().forEach((t) => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      setScreenSharing(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
        setScreenSharing(true)
        stream.getVideoTracks()[0].onended = () => setScreenSharing(false)
      } catch {}
    }
  }

  const toggleHand = () => {
    const socket = getSocket()
    if (!socket) return
    if (handRaised) {
      socket.emit('lower-hand', { roomId: id })
      setHandRaised(false)
    } else {
      socket.emit('raise-hand', { roomId: id })
      setHandRaised(true)
    }
  }

  const sendMessage = () => {
    if (!msgInput.trim()) return
    getSocket()?.emit('chat-message', { roomId: id, message: msgInput })
    setMsgInput('')
  }

  const startSession = async () => {
    await sessionService.start(id).catch(() => {})
    toast.success('Session started! Students have been notified 🔴')
    refetch()
  }

  const endSession = async () => {
    if (!isHost) return
    getSocket()?.emit('end-session', { roomId: id })
    await sessionService.complete(id).catch(() => {})
    navigate(`/sessions/${id}`)
    toast.success('Session completed! Credits transferred ⚡')
  }

  const leaveRoom = () => {
    getSocket()?.emit('leave-room', { roomId: id })
    navigate(`/sessions/${id}`)
  }

  // Whiteboard drawing
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const touch = e.touches?.[0] || e
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }

  const onDraw = (e) => {
    if (!drawing || !canvasRef.current) return
    const pos  = getCanvasPos(e)
    const last = lastPosRef.current || pos
    const ctx  = canvasRef.current.getContext('2d')

    if (tool === 'eraser') {
      ctx.clearRect(pos.x - 12, pos.y - 12, 24, 24)
    } else {
      ctx.beginPath()
      ctx.strokeStyle = drawColor
      ctx.lineWidth   = drawSize
      ctx.lineCap     = 'round'
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      getSocket()?.emit('whiteboard-draw', {
        roomId: id, x1: last.x, y1: last.y, x2: pos.x, y2: pos.y,
        color: drawColor, size: drawSize,
      })
    }
    lastPosRef.current = pos
  }

  const clearWhiteboard = () => {
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    getSocket()?.emit('whiteboard-clear', { roomId: id })
  }

  const totalParticipants = participants.length + 1
  const duration          = session?.duration || 60
  const isAlmostDone      = elapsed > duration * 60 - 5 * 60

  const togglePanel = (panel) => {
    setSidePanel((p) => p === panel ? null : panel)
    if (panel === 'chat') setUnreadCount(0)
  }

  // ─── Grid columns based on participant count ─────────────────────────────
  const cols = totalParticipants === 1 ? 'grid-cols-1'
    : totalParticipants === 2 ? 'grid-cols-2'
    : totalParticipants <= 4  ? 'grid-cols-2'
    : 'grid-cols-3'

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#07070D' }}>

      {/* ── Header ── */}
      <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(20px)' }}>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>S</div>
          <span className="font-semibold text-white text-sm truncate max-w-[180px]">
            {session?.title || 'Session Room'}
          </span>
          {isLive ? (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
            </span>
          ) : (
            <span className="hidden sm:block text-[10px] px-2 py-0.5 rounded-full text-white/40"
              style={{ background: 'rgba(255,255,255,0.07)' }}>Lobby</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className={`font-mono text-sm font-bold px-2.5 py-1 rounded-lg transition-colors
            ${isAlmostDone ? 'text-red-400 bg-red-500/10' : 'text-white/50 bg-white/5'}`}>
            {fmt(elapsed)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/40">
            <Users size={13} /> {totalParticipants}
          </span>
          {raisedHands.length > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="text-sm text-orange-400 font-semibold">
              ✋ {raisedHands.length}
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isHost && !isLive && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={startSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>
              <Play size={12} className="fill-white" /> Start Session
            </motion.button>
          )}
          {isHost ? (
            <button onClick={endSession}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-red-400 hover:text-white hover:bg-red-600"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              End
            </button>
          ) : (
            <button onClick={leaveRoom}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-600/20 transition-colors">
              Leave
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video area + controls */}
        <div className="flex-1 flex flex-col p-3 gap-3 min-w-0 overflow-hidden">

          {/* Video grid */}
          <div className={`flex-1 grid gap-3 ${cols}`} style={{ minHeight: 0 }}>

            {/* Local tile */}
            <VideoTile
              videoRef={localVideoRef}
              name={`${user?.name || 'You'} (You)`}
              isHost={isHost}
              audioMuted={!audioEnabled}
              videoOff={!videoEnabled}
              avatar={user?.avatar}
              userName={user?.name}
              isLocal
            />

            {/* Remote stream tiles */}
            {Object.entries(remoteStreams).map(([userId, stream]) => {
              const p = participants.find((x) => x.userId === userId)
              return (
                <VideoTile
                  key={userId}
                  stream={stream}
                  name={p?.name || 'Participant'}
                  avatar={p?.avatar}
                  userName={p?.name}
                  handRaised={raisedHands.includes(userId)}
                />
              )
            })}

            {/* Connecting tile for participants without a stream yet */}
            {participants
              .filter((p) => !remoteStreams[p.userId])
              .map((p) => (
                <ConnectingTile key={p.userId} name={p.name} avatar={p.avatar} />
              ))}
          </div>

          {/* Floating glass controls */}
          <div className="flex-shrink-0 flex justify-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl"
              style={{
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}>

              <CtrlBtn
                icon={audioEnabled ? <Mic size={17}/> : <MicOff size={17}/>}
                label={audioEnabled ? 'Mute' : 'Unmute'}
                active={!audioEnabled} danger onClick={toggleAudio} />
              <CtrlBtn
                icon={videoEnabled ? <Video size={17}/> : <VideoOff size={17}/>}
                label={videoEnabled ? 'Camera' : 'No Cam'}
                active={!videoEnabled} danger onClick={toggleVideo} />
              <CtrlBtn
                icon={screenSharing ? <MonitorOff size={17}/> : <Monitor size={17}/>}
                label="Screen" active={screenSharing} onClick={toggleScreenShare} />
              <CtrlBtn
                icon={<Hand size={17}/>}
                label={handRaised ? 'Lower' : 'Hand'}
                active={handRaised} onClick={toggleHand} />

              <Divider />

              <CtrlBtn icon={<MessageSquare size={17}/>} label="Chat"
                active={sidePanel === 'chat'} badge={sidePanel !== 'chat' ? unreadCount : 0}
                onClick={() => togglePanel('chat')} />
              <CtrlBtn icon={<Users size={17}/>} label="People"
                active={sidePanel === 'participants'} badge={totalParticipants}
                onClick={() => togglePanel('participants')} />
              <CtrlBtn icon={<Pencil size={17}/>} label="Board"
                active={sidePanel === 'whiteboard'}
                onClick={() => togglePanel('whiteboard')} />

              <Divider />

              {isHost ? (
                <button onClick={endSession}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-white text-[10px] font-semibold transition-all bg-red-600 hover:bg-red-700">
                  <PhoneOff size={17} /> End
                </button>
              ) : (
                <button onClick={leaveRoom}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-[10px] font-semibold transition-all text-red-400 hover:text-white hover:bg-red-600"
                  style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
                  <PhoneOff size={17} /> Leave
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Side panels ── */}
        <AnimatePresence mode="wait">

          {sidePanel === 'chat' && (
            <Panel key="chat" title="Chat" onClose={() => setSidePanel(null)}>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {messages.length === 0 && (
                  <p className="text-center text-white/20 text-sm py-10">No messages yet — say hi 👋</p>
                )}
                {messages.map((m) => {
                  const mine = m.userId?.toString() === user?._id?.toString()
                  return (
                    <div key={m.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                      <Avatar src={m.avatar} name={m.name} size="xs" className="flex-shrink-0 mt-1" />
                      <div className={`max-w-[75%] flex flex-col gap-0.5 ${mine ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-white/25 px-1">{m.name} · {fmtTime(m.timestamp)}</span>
                        <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                          style={{
                            background: mine
                              ? 'linear-gradient(135deg, rgba(204,82,0,0.85), rgba(255,140,0,0.75))'
                              : 'rgba(255,255,255,0.08)',
                            borderRadius: mine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                            color: 'rgba(255,255,255,0.9)',
                          }}>
                          {m.message}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="flex-shrink-0 p-3 border-t flex gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <input className="input flex-1 py-2 text-sm" placeholder="Message…"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} disabled={!msgInput.trim()}
                  className="px-3 py-2 rounded-xl text-white disabled:opacity-30 transition-all"
                  style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>
                  <Send size={15} />
                </button>
              </div>
            </Panel>
          )}

          {sidePanel === 'participants' && (
            <Panel key="participants" title={`People · ${totalParticipants}`} onClose={() => setSidePanel(null)}>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {/* You */}
                <PersonRow
                  name={user?.name} avatar={user?.avatar}
                  isHost={isHost} isYou
                  audioMuted={!audioEnabled} videoOff={!videoEnabled} />
                {/* Others */}
                {participants.map((p) => (
                  <PersonRow
                    key={p.userId}
                    name={p.name} avatar={p.avatar}
                    handRaised={raisedHands.includes(p.userId)}
                    canRemove={isHost}
                    onRemove={() => getSocket()?.emit('remove-user', { roomId: id, userId: p.userId })}
                  />
                ))}
              </div>
            </Panel>
          )}

          {sidePanel === 'whiteboard' && (
            <Panel key="whiteboard" title="Whiteboard" onClose={() => setSidePanel(null)} width={520}
              extra={
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setTool('pen')}
                    className={`p-1.5 rounded-lg transition-colors ${tool === 'pen' ? 'text-orange-400 bg-orange-500/10' : 'text-white/35 hover:text-white'}`}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setTool('eraser')}
                    className={`p-1.5 rounded-lg transition-colors ${tool === 'eraser' ? 'text-orange-400 bg-orange-500/10' : 'text-white/35 hover:text-white'}`}>
                    <Eraser size={13} />
                  </button>
                  {['#FF6B00','#ffffff','#06b6d4','#a78bfa','#f59e0b','#10b981','#ef4444'].map((c) => (
                    <button key={c} onClick={() => setDrawColor(c)} style={{ background: c }}
                      className={`w-4.5 h-4.5 rounded-full border-2 transition-all ${drawColor === c ? 'border-white scale-125' : 'border-transparent'}`}
                    />
                  ))}
                  <button onClick={clearWhiteboard}
                    className="ml-1 text-[11px] text-white/30 hover:text-white/70 transition-colors px-1">
                    Clear
                  </button>
                </div>
              }>
              <canvas
                ref={canvasRef} width={520} height={600}
                className="flex-1 w-full cursor-crosshair"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                onMouseDown={(e) => { setDrawing(true); lastPosRef.current = getCanvasPos(e) }}
                onMouseMove={onDraw}
                onMouseUp={() => { setDrawing(false); lastPosRef.current = null }}
                onMouseLeave={() => setDrawing(false)}
              />
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── VideoTile ───────────────────────────────────────────────────────────────
function VideoTile({ videoRef, stream, name, isHost, audioMuted, videoOff, avatar, userName, isLocal, handRaised }) {
  const remoteRef = useRef()

  useEffect(() => {
    if (!isLocal && stream && remoteRef.current && remoteRef.current.srcObject !== stream) {
      remoteRef.current.srcObject = stream
    }
  }, [stream, isLocal])

  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{
        background: '#0d1017',
        border: '1px solid rgba(255,255,255,0.06)',
        minHeight: '160px',
      }}>

      {isLocal
        ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        : <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
      }

      {/* Avatar fallback when camera is off */}
      {(isLocal ? videoOff : !stream) && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,107,0,0.07) 0%, #0d1017 70%)' }}>
          <Avatar src={avatar} name={userName} size="xl" />
        </div>
      )}

      {/* Name + indicators bar */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
        <span className="text-xs text-white/90 font-medium truncate max-w-[70%]">{name}</span>
        <div className="flex items-center gap-1.5">
          {handRaised && <span className="text-sm leading-none">✋</span>}
          {audioMuted  && <MicOff  size={11} className="text-red-400" />}
          {videoOff    && <VideoOff size={11} className="text-red-400" />}
        </div>
      </div>

      {/* Host badge */}
      {isHost && (
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: 'rgba(255,107,0,0.75)', backdropFilter: 'blur(4px)' }}>
          Host
        </div>
      )}
    </div>
  )
}

// ─── ConnectingTile ──────────────────────────────────────────────────────────
function ConnectingTile({ name, avatar }) {
  return (
    <div className="relative rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ background: '#0d1017', border: '1px solid rgba(255,255,255,0.06)', minHeight: '160px' }}>
      <div className="flex flex-col items-center gap-3">
        <Avatar src={avatar} name={name} size="lg" />
        <div className="text-center">
          <p className="text-sm text-white/70 font-medium">{name}</p>
          <motion.p animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-white/30 mt-0.5">Connecting…</motion.p>
        </div>
      </div>
    </div>
  )
}

// ─── Panel ───────────────────────────────────────────────────────────────────
function Panel({ children, title, onClose, width = 320, extra }) {
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ width, background: 'rgba(255,255,255,0.025)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      className="flex flex-col overflow-hidden flex-shrink-0">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          {extra}
          <button onClick={onClose}
            className="p-1 rounded-lg text-white/35 hover:text-white hover:bg-white/8 transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

// ─── PersonRow ───────────────────────────────────────────────────────────────
function PersonRow({ name, avatar, isHost, isYou, audioMuted, videoOff, handRaised, canRemove, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/4 transition-colors group">
      <Avatar src={avatar} name={name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {name}{isYou && <span className="text-white/35 font-normal text-xs"> (You)</span>}
        </p>
        {isHost     && <p className="text-[10px] text-orange-400">Host</p>}
        {handRaised && <p className="text-[10px] text-yellow-400">✋ Raised hand</p>}
      </div>
      <div className="flex items-center gap-1.5">
        {audioMuted && <MicOff   size={12} className="text-red-400/70" />}
        {videoOff   && <VideoOff size={12} className="text-red-400/70" />}
        {canRemove  && !isYou && (
          <button onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-all text-[11px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded-md hover:bg-red-500/10">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

// ─── CtrlBtn ─────────────────────────────────────────────────────────────────
function CtrlBtn({ icon, label, active = false, danger = false, onClick, badge = 0 }) {
  return (
    <button onClick={onClick}
      className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150
        ${active
          ? danger ? 'bg-red-600/30 text-red-400' : 'bg-orange-500/20 text-orange-400'
          : 'text-white/55 hover:bg-white/8 hover:text-white'
        }`}>
      {icon}
      <span className="text-[10px] font-medium leading-none">{label}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-px h-7 mx-0.5" style={{ background: 'rgba(255,255,255,0.1)' }} />
}
