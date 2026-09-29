import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BrainCircuit,
  Zap,
  FileText,
  Sparkles,
  LockKeyhole,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/app/scanner', label: 'Analyze', icon: Zap },
  { to: '/app/intelligence', label: 'Intelligence', icon: BrainCircuit },
  { to: '/app/history', label: 'Activity', icon: FileText },
  { to: '/app/reports', label: 'Reports', icon: FileText },
];

interface GlassSidebarProps {
  isCollapsed?: boolean;
  onOpenCopilot?: () => void;
}

export const GlassSidebar: React.FC<GlassSidebarProps> = ({
  isCollapsed,
  onOpenCopilot,
}) => {
  const { user } = useAuth();

  const fullName = user?.profile?.full_name || 'Alex Kim';
  const role = user?.role === 'admin' ? 'Lead Security Analyst' : 'Security Analyst';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className={isCollapsed ? 'collapsed' : ''}>
      <div>
        <Logo />
        <small className="console-label">SECURITY CONSOLE</small>

        <div className="side-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              title={label}
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
            to="/app/copilot"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-cyan" />
            <span>AI Copilot</span>
          </NavLink>
          <NavLink
            to="/app/settings"
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

        <NavLink to="/app/profile" className="user hover:bg-white/5 transition-colors rounded-lg">
          <span>{initials}</span>
          <div>
            <b>{fullName}</b>
            <small>{role}</small>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default GlassSidebar;
