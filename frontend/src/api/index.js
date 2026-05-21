import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

/** No JWT — used for login only */
const publicApi = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)

export const authApi = {
  login: (data) => publicApi.post('/auth/login', data),
}

export const accountsApi = {
  getAll: () => api.get('/accounts'),
  add: (data) => api.post('/accounts', data),
  remove: (id) => api.delete(`/accounts/${id}`),
}

export const domainsApi = {
  getAll: (params) => api.get('/domains/all', { params }),
  getStats: () => api.get('/domains/stats'),
  syncAll: () => api.post('/domains/sync'),
  syncAccount: (id) => api.post(`/domains/sync/${id}`),
  updateTag: (id, clientTag) => api.patch(`/domains/${id}/tag`, { clientTag }),
}

export default api
