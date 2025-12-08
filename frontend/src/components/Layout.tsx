import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import { useAuth } from '../hooks/useAuth'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const navigation = [
    { name: 'Painel', path: '/dashboard' },
    { name: 'Voluntários', path: '/volunteers' },
    { name: 'Oficinas', path: '/workshops' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-200">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                  ELLP - Plataforma de Voluntários
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && user && (
                <span className="text-sm text-gray-700">
                  Olá, <span className="font-medium">{user.name}</span>
                </span>
              )}
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  Sair
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => navigate('/login')}
                  className="text-sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
