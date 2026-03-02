import api from './api'

export const sessionService = {
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  getTrending: () => api.get('/sessions/trending'),
  getMyHosted: () => api.get('/sessions/my/hosted'),
  getMyBooked: () => api.get('/sessions/my/booked'),
  create: (data) => api.post('/sessions', data),
  book: (id) => api.post(`/sessions/${id}/book`),
  cancel: (id, reason) => api.post(`/sessions/${id}/cancel`, { reason }),
  start: (id) => api.post(`/sessions/${id}/start`),
  complete: (id) => api.post(`/sessions/${id}/complete`),
}

export const reviewService = {
  create: (sessionId, data) => api.post(`/reviews/session/${sessionId}`, data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
}

export const userService = {
  getProfile: (id) => api.get(`/users/${id}`),
  getProfileBySlug: (slug) => api.get(`/users/profile/${slug}`),
  updateProfile: (data) => api.patch('/users/me', data),
  uploadAvatar: (file) => {
    const fd = new FormData()
    fd.append('avatar', file)
    return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getTransactions: (params) => api.get('/users/me/transactions', { params }),
  searchTeachers: (params) => api.get('/users/teachers', { params }),
  getSkillSuggestions: () => api.get('/users/skills/suggestions'),
  toggleBookmark: (sessionId) => api.post(`/users/me/bookmarks/${sessionId}`),
}

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
}

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, reason) => api.patch(`/admin/users/${id}/ban`, { reason }),
  adjustCredits: (id, data) => api.post(`/admin/users/${id}/credits`, data),
  getSessions: (params) => api.get('/admin/sessions', { params }),
}
