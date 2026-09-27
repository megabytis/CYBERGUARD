import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { GlassNavbar } from './GlassNavbar';
import { GlassSidebar } from './GlassSidebar';
import { AIChatDrawer } from '@/components/copilot/AIChatDrawer';
import { GlassCommandPalette } from '@/components/ui/GlassCommandPalette';

export const CyberGuardAppShell: React.FC = () => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <div className="app-shell selection:bg-cyan-500/20 selection:text-cyan-400">
      {/* Global Command Palette (⌘ K) */}
      <GlassCommandPalette onOpenCopilot={() => setIsCopilotOpen(true)} />

      {/* Left Sidebar from v0 */}
      <GlassSidebar onOpenCopilot={() => setIsCopilotOpen(true)} />

      {/* Main Container */}
      <main className="app-main flex flex-col min-h-screen">
        <GlassNavbar />

        {/* Dynamic Route Content */}
        <div className="flex-1 overflow-x-hidden min-w-0">
          <Outlet context={{ onOpenCopilot: () => setIsCopilotOpen(true) }} />
        </div>
      </main>

      {/* Slide-over Copilot Drawer */}
      <AIChatDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};

export const AppLayout = CyberGuardAppShell;
export default CyberGuardAppShell;
