import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',              label: 'Inicio',       icon: HomeIcon },
  { to: '/movimientos',   label: 'Movimientos',  icon: ListIcon },
  { to: '/estadisticas',  label: 'Stats',        icon: ChartIcon },
  { to: '/metas',         label: 'Metas',        icon: TargetIcon },
  { to: '/deudas',        label: 'Deudas',       icon: CreditIcon },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex max-w-md mx-auto">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-flux-black' : 'text-flux-gray'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ListIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" strokeWidth={active ? 2.2 : 1.8} />
      <line x1="8" y1="12" x2="21" y2="12" strokeWidth={active ? 2.2 : 1.8} />
      <line x1="8" y1="18" x2="21" y2="18" strokeWidth={active ? 2.2 : 1.8} />
      <circle cx="3.5" cy="6" r="1.5" fill="currentColor" />
      <circle cx="3.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" strokeWidth={active ? 2.2 : 1.8} />
      <line x1="12" y1="20" x2="12" y2="4" strokeWidth={active ? 2.2 : 1.8} />
      <line x1="6" y1="20" x2="6" y2="14" strokeWidth={active ? 2.2 : 1.8} />
    </svg>
  )
}

function TargetIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" strokeWidth={active ? 2.2 : 1.8} />
      <circle cx="12" cy="12" r="6" strokeWidth={active ? 2.2 : 1.8} />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

function CreditIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth={active ? 2.2 : 1.8} />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}
