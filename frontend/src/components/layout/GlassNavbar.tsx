import React, { useState } from 'react';
import { Bell, Menu, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface GlassNavbarProps {
  onOpenCommandPalette?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const fullName = user?.profile?.full_name || 'Alex Kim';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="app-header">
      {/* 3 lines sidebar toggle button */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="sidebar-toggle-btn"
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Header Actions: AI READY status, Notifications, User */}
      <div className="header-actions relative">
        <span className="flex items-center">
          <i /> AI READY
        </span>

        {/* Theme Toggle (Dark / Light) */}
        <ThemeToggle />

        {/* Notifications Icon with popover */}
        <div className="relative">
          <Bell
            onClick={() => setShowNotifications(!showNotifications)}
            className="cursor-pointer hover:text-cyan transition-colors"
          />
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 p-4 rounded-xl panel shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-mono font-bold">
                <span className="text-text-primary">SYSTEM TELEMETRY</span>
                <span className="text-lime">ONLINE</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-white/5 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                  <div>
                    <b className="text-text-primary block font-mono">Zero-SSRF Active</b>
                    <span className="text-muted-ink">Static tokenization active across all 7 vectors.</span>
                  </div>
                </div>
                <div className="p-2 rounded bg-white/5 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
                  <div>
                    <b className="text-text-primary block font-mono">Groq Llama 3 Synced</b>
                    <span className="text-muted-ink">Evidence synthesis ready with automated local fallback.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User avatar display */}
        <div className="flex items-center gap-2">
          <b title={fullName}>{initials}</b>
        </div>
      </div>
    </header>
  );
};

export default GlassNavbar;
