import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { GlassNavbar } from './GlassNavbar';
import { GlassSidebar } from './GlassSidebar';
import { AIChatDrawer } from '@/components/copilot/AIChatDrawer';
import { GlassCommandPalette } from '@/components/ui/GlassCommandPalette';
import { ScanRecord } from '@/lib/api';

export const CyberGuardAppShell: React.FC = () => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeScan, setActiveScan] = useState<ScanRecord | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleOpenCopilot = (scan?: ScanRecord | null) => {
    if (scan) {
      setActiveScan(scan);
    }
    setIsCopilotOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className={`app-shell selection:bg-cyan-500/20 selection:text-cyan-400 ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Global Command Palette (⌘ K) */}
      <GlassCommandPalette onOpenCopilot={() => handleOpenCopilot()} />

      {/* Left Sidebar */}
      <GlassSidebar
        isCollapsed={sidebarCollapsed}
        onOpenCopilot={() => handleOpenCopilot()}
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

      {/* Slide-over Copilot Drawer */}
      <AIChatDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeScan={activeScan}
      />
    </div>
  );
};

export const AppLayout = CyberGuardAppShell;
export default CyberGuardAppShell;
