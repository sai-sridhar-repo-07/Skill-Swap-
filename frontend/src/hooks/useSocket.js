import { useEffect, useRef, createElement as h } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import toast from 'react-hot-toast'

let socketInstance = null

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !accessToken || initialized.current) return
    initialized.current = true

    const serverUrl = import.meta.env.VITE_API_URL || window.location.origin
    socketInstance = io(serverUrl, {
      auth: { token: accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketInstance.on('connect', () => console.log('✅ Socket connected'))
    socketInstance.on('disconnect', () => console.log('❌ Socket disconnected'))

    socketInstance.on('notification', (notification) => {
      addNotification(notification)
      toast(notification.title, {
        icon: '🔔',
        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
      })
    })

    // When a booked session goes live — show a clickable banner toast
    socketInstance.on('session-live', ({ sessionId, title }) => {
      toast.custom((t) => h('div', {
        onClick: () => { window.location.href = `/sessions/${sessionId}/room`; toast.dismiss(t.id) },
        style: {
          background: 'linear-gradient(135deg, rgba(204,82,0,0.97), rgba(255,140,0,0.93))',
          color: 'white', border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '16px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '12px',
          minWidth: '280px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(255,107,0,0.35)',
        },
      },
        h('span', { style: { fontSize: '22px' } }, '🔴'),
        h('div', null,
          h('p', { style: { fontWeight: 700, fontSize: '14px', margin: 0 } }, `${title} is Live!`),
          h('p', { style: { fontSize: '12px', opacity: 0.82, margin: '2px 0 0' } }, 'Tap to join now →'),
        ),
      ), { duration: 12000 })
    })

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
        initialized.current = false
      }
    }
  }, [isAuthenticated, accessToken])

  return socketInstance
}

export const getSocket = () => socketInstance
