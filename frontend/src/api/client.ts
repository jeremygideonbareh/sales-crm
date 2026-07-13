import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  listUsers: () => api.get('/auth/users').then((r) => r.data),
}

export const leadsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/leads', { params }).then((r) => r.data),
  upload: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/leads/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  assign: (leadIds: number[], repId: number) =>
    api.post('/leads/assign', { lead_ids: leadIds, rep_id: repId }).then((r) => r.data),
  update: (leadId: number, data: Record<string, unknown>) =>
    api.put(`/leads/${leadId}`, data).then((r) => r.data),
  delete: (leadId: number) =>
    api.delete(`/leads/${leadId}`).then((r) => r.data),
  deleteBulk: (leadIds: number[]) =>
    api.post('/leads/delete-bulk', { lead_ids: leadIds }).then((r) => r.data),
}

export const repsApi = {
  nextLead: () => api.get('/reps/next-lead').then((r) => r.data),
  updateStatus: (leadId: number, data: { status: string; notes?: string; deal_value?: number }) =>
    api.put(`/reps/leads/${leadId}/status`, data).then((r) => r.data),
  dashboard: () => api.get('/reps/dashboard').then((r) => r.data),
  demoRequests: {
    list: () => api.get('/reps/demo-requests').then((r) => r.data),
    create: (data: {
      lead_id: number
      title: string
      description?: string
      scheduled_date?: string
      notes?: string
    }) => api.post('/reps/demo-requests', data).then((r) => r.data),
    update: (id: number, data: { status?: string; scheduled_date?: string; notes?: string }) =>
      api.put(`/reps/demo-requests/${id}`, data).then((r) => r.data),
  },
  handovers: {
    list: () => api.get('/reps/handovers').then((r) => r.data),
    create: (data: {
      lead_id: number
      notes?: string
      handover_details?: string
      client_brief?: string
      requirements?: string
      design_preferences?: string
      budget?: number
      timeline_notes?: string
    }) => api.post('/reps/handovers', data).then((r) => r.data),
  },
  callLogs: {
    list: () => api.get('/reps/call-logs').then((r) => r.data),
  },
}

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard').then((r) => r.data),
  leaderboard: () => api.get('/analytics/leaderboard').then((r) => r.data),
}

export const pipelineApi = {
  overview: () => api.get('/pipeline/overview').then((r) => r.data),
}

export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id: number) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
}

export const emailSequencesApi = {
  list: () => api.get('/email-sequences').then((r) => r.data),
  get: (id: number) => api.get(`/email-sequences/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) => api.post('/email-sequences', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/email-sequences/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/email-sequences/${id}`).then((r) => r.data),
  setSteps: (id: number, steps: Record<string, unknown>[]) => api.put(`/email-sequences/${id}/steps`, steps).then((r) => r.data),
  logs: (sequenceId?: number) => api.get(`/email-sequences/logs/all`, { params: sequenceId ? { sequence_id: sequenceId } : {} }).then((r) => r.data),
}
