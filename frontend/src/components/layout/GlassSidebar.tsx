import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BrainCircuit,
  Zap,
  FileText,
  LockKeyhole,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

const navItems = [
  { to: '/app/scanner', label: 'Analyze', icon: Zap },
  { to: '/app/intelligence', label: 'Intelligence', icon: BrainCircuit },
  { to: '/app/history', label: 'Activity', icon: FileText },
  { to: '/app/reports', label: 'Reports', icon: FileText },
];

interface GlassSidebarProps {
  isCollapsed?: boolean;
  onOpenCopilot?: () => void;
  onCloseMobile?: () => void;
}

export const GlassSidebar: React.FC<GlassSidebarProps> = ({
  isCollapsed,
  onOpenCopilot,
  onCloseMobile,
}) => {
  return (
    <aside className={isCollapsed ? 'collapsed' : ''}>
      <div>
        <div className="flex items-center justify-between">
          <Logo />
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-cyan md:hidden cursor-pointer"
              title="Close navigation"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <small className="console-label">SECURITY CONSOLE</small>

        <div className="side-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              title={label}
              onClick={onCloseMobile}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div>
        <div className="side-bottom">
          <NavLink
            to="/app/settings"
            onClick={onCloseMobile}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <LockKeyhole className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="protection">
          <i />
          <div>
            <b>PROTECTION ACTIVE</b>
            <small>All systems operational</small>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GlassSidebar;
