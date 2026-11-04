import { NavLink } from 'react-router-dom'
import {
  FiGrid,
  FiCreditCard,
  FiBarChart2,
  FiBriefcase,
  FiSend,
  FiDownload,
  FiUser,
  FiX,
} from 'react-icons/fi'
import BrandLogo from "./BrandLogo";

type SidebarProps = {
  onNavigate?: () => void
  onClose?: () => void
}

const navigation = [
  { label: 'Overview', path: '/', icon: FiGrid },
  { label: 'Expenses', path: '/expenses', icon: FiCreditCard },
  { label: 'Analytics', path: '/analytics', icon: FiBarChart2 },
  { label: 'Accounts', path: '/accounts', icon: FiBriefcase },
  { label: 'Send money', path: '/send', icon: FiSend },
  { label: 'Receive', path: '/receive', icon: FiDownload },
  { label: 'Profile', path: '/profile', icon: FiUser },
]

export default function Sidebar({
  onNavigate,
  onClose,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-white px-5 py-6 text-slate-700">
      <div className="mb-10 flex items-center justify-between">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <BrandLogo size="large" />

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Aven
          </span>
        </NavLink>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Workspace
      </p>

      <nav className="space-y-1">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')
            }
          >
            <Icon size={19} strokeWidth={1.8} />
            <span>{label}</span>

            {label === 'Analytics' && (
              <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                NEW
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-50 p-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <FiBarChart2 size={18} />
        </div>

        <p className="text-sm font-semibold text-slate-800">
          Understand your money
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Review your spending patterns and make better financial decisions.
        </p>
      </div>
    </aside>
  )
}