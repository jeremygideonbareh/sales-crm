import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      id: 1,
      email: 'admin@agency.com',
      full_name: 'Agency Manager',
      role: 'manager',
      is_active: true,
    })
  }),
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ access_token: 'mock-token' })
  }),
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      kpi: { total_calls: 100, total_deals: 25, success_rate: 25, total_commission_owed: 50000, total_leads: 200, active_reps: 5 },
      by_rep: [],
      status_distribution: [],
    })
  }),
  http.get('/api/analytics/leaderboard', () => {
    return HttpResponse.json({ entries: [] })
  }),
]
