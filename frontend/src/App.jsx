import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import DashboardPage from './pages/DashboardPage'
import AccountsPage from './pages/AccountsPage'
import Sidebar from './components/Sidebar'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
})

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-primary)' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
            </Route>
            <Route path="/login" element={<Navigate to="/accounts" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
        }} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
