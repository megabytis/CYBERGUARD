import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { GlassNavbar } from './GlassNavbar';
import { GlassSidebar } from './GlassSidebar';
import { CyberGuardAIChatbot } from '@/components/copilot/CyberGuardAIChatbot';
import { GlassCommandPalette } from '@/components/ui/GlassCommandPalette';
import { ScanRecord } from '@/lib/api';

export const CyberGuardAppShell: React.FC = () => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeScan, setActiveScan] = useState<ScanRecord | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleOpenCopilot = (scan?: ScanRecord | null) => {
    if (scan) {
      setActiveScan(scan);
    }
    setIsCopilotOpen(true);
  };

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setMobileNavOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div
      className={`app-shell selection:bg-cyan-500/20 selection:text-cyan-400 ${
        sidebarCollapsed ? 'sidebar-collapsed' : ''
      } ${mobileNavOpen ? 'mobile-nav-open' : ''}`}
    >
      {/* Mobile Darkened Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Global Command Palette (⌘ K) */}
      <GlassCommandPalette onOpenCopilot={() => handleOpenCopilot()} />

      {/* Left Sidebar */}
      <GlassSidebar
        isCollapsed={sidebarCollapsed}
        onOpenCopilot={() => handleOpenCopilot()}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Container */}
      <main className="app-main flex flex-col min-h-screen">
        <GlassNavbar
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* Dynamic Route Content */}
        <div className="flex-1 overflow-x-hidden min-w-0">
          <Outlet context={{ onOpenCopilot: handleOpenCopilot }} />
        </div>
      </main>

      {/* CYBERGUARD AI Chatbot Screen Pop-Up */}
      <CyberGuardAIChatbot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onOpen={() => setIsCopilotOpen(true)}
        activeScan={activeScan}
      />
    </div>
  );
};

export const AppLayout = CyberGuardAppShell;
export default CyberGuardAppShell;
