import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, BarChart2, Menu } from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
  // { to: '/admin/agents', icon: Users, label: 'Agents' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
]

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_open')
    if (saved !== null) setOpen(saved === '1')
  }, [])

  useEffect(() => {
    localStorage.setItem('admin_sidebar_open', open ? '1' : '0')
  }, [open])

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`bg-white border-r transition-all duration-200 ${open ? 'w-64' : 'w-16'} hidden md:flex flex-col`}> 
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <span className={`font-semibold text-gray-900 ${open ? 'block' : 'hidden'}`}>Admin</span>
          <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen(o => !o)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className={`${open ? 'block' : 'hidden'}`}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b flex items-center justify-between px-4 z-40">
        <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen(o => !o)}>
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold">Admin</span>
        <div />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-14 left-0 bottom-0 w-64 bg-white border-r p-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 w-full">
        <div className="md:hidden h-14" />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
