import { NavLink, Outlet, useLocation } from 'react-router-dom';

const nav = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: '◉', label: 'Dashboard' },
      { to: '/matrix', icon: '⊞', label: 'Status Matrix' },
      { to: '/actions', icon: '⏳', label: 'Action Queue' },
    ],
  },
  {
    label: 'Businesses',
    items: [
      { to: '/businesses', icon: '🏢', label: 'All Businesses' },
      { to: '/businesses/new', icon: '+', label: 'Add Business' },
      { to: '/businesses/import', icon: '↑', label: 'Import CSV' },
    ],
  },
  {
    label: 'Directories',
    items: [
      { to: '/directories', icon: '☰', label: 'Directories' },
      { to: '/directories/new', icon: '+', label: 'Add Directory' },
    ],
  },
  {
    label: 'Reporting',
    items: [{ to: '/export', icon: '↓', label: 'Export Data' }],
  },
];

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/businesses' || to === '/directories'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="w-4 text-center text-xs leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const location = useLocation();

  // breadcrumb: derive page title from pathname
  const segment = location.pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  const pageTitle =
    segment === 'dashboard'
      ? 'Dashboard'
      : segment === 'matrix'
        ? 'Status Matrix'
        : segment === 'actions'
          ? 'Action Queue'
          : segment === 'businesses'
            ? 'Businesses'
            : segment === 'directories'
              ? 'Directories'
              : segment === 'export'
                ? 'Export'
                : segment;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            N
          </div>
          <span className="text-sm font-semibold text-gray-900">NAP Citations</span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {nav.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to} {...item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-[11px] text-gray-400">NAP Citation Engine</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
          <h1 className="text-base font-semibold text-gray-900 capitalize">{pageTitle}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
