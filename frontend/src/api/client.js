import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE })

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login', data),
  me:       ()       => api.get('/auth/me'),
  rotateKey: ()      => api.post('/auth/rotate-key'),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const domainsAPI = {
  list:    ()           => api.get('/dashboard/domains'),
  create:  (data)       => api.post('/dashboard/domains', data),
  update:  (id, data)   => api.put(`/dashboard/domains/${id}`, data),
  delete:  (id)         => api.delete(`/dashboard/domains/${id}`),
  upload:  (id, file)   => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/dashboard/domains/${id}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export const analyticsAPI = {
  summary: () => api.get('/dashboard/analytics'),
  plan:    () => api.get('/dashboard/plan'),
}

// ── Ask (uses API key, not JWT) ───────────────────────────────────────────────
export const askAPI = {
  ask: (apiKey, domainId, question, history = []) =>
    axios.post(`${BASE}/ask`, { domain_id: domainId, question, history }, {
      headers: { 'X-API-Key': apiKey }
    }),
}

export default api