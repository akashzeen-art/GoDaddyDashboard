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
      <main className="flex-1 overflow-auto app-main">
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
