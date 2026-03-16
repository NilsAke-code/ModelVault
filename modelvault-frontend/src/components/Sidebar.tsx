import { NavLink } from 'react-router-dom';
import { Home, Box, Library, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-accent/10 text-accent border-l-2 border-accent'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
    }`;

  const nav = (
    <>
      <div className="px-4 py-6">
        <h1 className="text-lg font-bold text-accent tracking-tight">3DModelVault</h1>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        <NavLink to="/" className={linkClass} onClick={() => setMobileOpen(false)}>
          <Home size={18} /> Home
        </NavLink>
        <NavLink to="/models" className={linkClass} onClick={() => setMobileOpen(false)}>
          <Box size={18} /> All Models
        </NavLink>
        <div className="border-t border-border my-3 mx-2" />
        <span className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">You</span>
        <NavLink to="/library" className={linkClass} onClick={() => setMobileOpen(false)}>
          <Library size={18} /> My Library
        </NavLink>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-secondary text-text-primary md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[200px] bg-bg-secondary border-r border-border z-40 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {nav}
      </aside>
    </>
  );
}
