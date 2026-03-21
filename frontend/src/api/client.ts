import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL || '/api'
export const client = axios.create({ baseURL: API })

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tms_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`

  try {
    const authState = JSON.parse(localStorage.getItem('tms_auth') || '{}')
    if (authState?.state?.activeProjectId) {
      cfg.headers['x-project-id'] = authState.state.activeProjectId
    }
  } catch { }

  return cfg
})

client.interceptors.response.use(r => r, async err => {
  const orig = err.config
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true
    const refresh = localStorage.getItem('tms_refresh')
    if (refresh) {
      try {
        const { data } = await axios.post(`${API}/auth/refresh`, { refreshToken: refresh })
        localStorage.setItem('tms_token', data.token)
        orig.headers.Authorization = `Bearer ${data.token}`
        return client(orig)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
  }
  const msg = err.response?.data?.error || 'Something went wrong'
  if (err.response?.status !== 401) toast.error(msg)
  return Promise.reject(err)
})
