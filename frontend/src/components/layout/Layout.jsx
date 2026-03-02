import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'

export default function Layout() {
  const { isAuthenticated } = useAuthStore()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex pt-16">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''} min-h-[calc(100vh-4rem)]`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
