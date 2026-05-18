import { NavLink } from 'react-router-dom'
import { Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const navLinks = [
  { to: '/', label: 'Feed', end: true },
  { to: '/for-you', label: 'For You' },
  { to: '/about', label: 'About' },
]

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            <Zap size={18} className="text-blue-400 fill-blue-400" />
            Signal
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white bg-slate-800'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/subscribe"
              className={({ isActive }) =>
                clsx(
                  'ml-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                )
              }
            >
              Subscribe
            </NavLink>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-slate-400 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-800 px-5 py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white bg-slate-800'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/subscribe"
              onClick={() => setMobileOpen(false)}
              className="mt-1 px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white text-center"
            >
              Subscribe
            </NavLink>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 pb-16">
        {children}
      </main>
    </div>
  )
}

export default Layout
