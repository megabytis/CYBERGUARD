import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  Globe,
  Mail,
  MessageSquare,
  QrCode,
  ShieldAlert,
  Network,
  FileCode,
  History,
  FileText,
  BarChart3,
  Bot,
  Search,
} from 'lucide-react';

interface GlassCommandPaletteProps {
  onOpenCopilot?: () => void;
}

export const GlassCommandPalette: React.FC<GlassCommandPaletteProps> = ({ onOpenCopilot }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        // don't trigger when inside inputs
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md">
      <div
        className="fixed inset-0"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl shadow-2xl overflow-hidden border border-border-bright z-10">
        <Command
          label="CyberGuard Command Menu"
          className="w-full flex flex-col bg-transparent text-text-primary"
        >
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <Command.Input
              placeholder="Type a command, scan vector, or search action... (Esc to exit)"
              className="w-full h-14 bg-transparent text-base text-text-primary placeholder:text-text-muted outline-none font-mono"
            />
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-3 space-y-2">
            <Command.Empty className="p-6 text-center text-sm font-mono text-text-muted">
              No matching security actions found.
            </Command.Empty>

            <Command.Group heading="Direct Scanner Vectors" className="text-xs font-mono text-text-muted px-2 py-1 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/scanner?type=url'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <Globe className="w-4 h-4 text-information" />
                <span className="text-base font-medium">Analyze Target URL</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/scanner?type=email'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <Mail className="w-4 h-4 text-information" />
                <span className="text-base font-medium">Analyze Suspicious Email</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/scanner?type=message'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <MessageSquare className="w-4 h-4 text-information" />
                <span className="text-base font-medium">Analyze SMS / Instant Message</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/scanner?type=qr'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <QrCode className="w-4 h-4 text-information" />
                <span className="text-base font-medium">Decode & Analyze QR Code</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/scanner?type=auth_log'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <ShieldAlert className="w-4 h-4 text-information" />
                <span className="text-base font-medium">Analyze Authentication Syslog</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/scanner?type=network'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <Network className="w-4 h-4 text-information" />
                <span className="text-base font-medium">Analyze Network Activity Telemetry</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/scanner?type=headers'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <FileCode className="w-4 h-4 text-information" />
                <span className="text-base font-medium">Inspect Raw RFC Email Headers</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation & Operations" className="text-xs font-mono text-text-muted px-2 py-1 uppercase tracking-wider pt-2 border-t border-border">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/history'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <History className="w-4 h-4 text-protected" />
                <span className="text-base font-medium">View Scan History & Past Incidents</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/reports'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <FileText className="w-4 h-4 text-protected" />
                <span className="text-base font-medium">Generate Incident Reports</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/app/analytics'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
              >
                <BarChart3 className="w-4 h-4 text-protected" />
                <span className="text-base font-medium">Open Telemetry & Metrics</span>
              </Command.Item>
              {onOpenCopilot && (
                <Command.Item
                  onSelect={() => runCommand(() => onOpenCopilot())}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-surface-glass-active text-text-primary transition-colors aria-selected:bg-information/20 aria-selected:text-information"
                >
                  <Bot className="w-4 h-4 text-information" />
                  <span className="text-base font-medium">Launch AI Security Copilot</span>
                </Command.Item>
              )}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2 bg-surface-elevated border-t border-border text-xs font-mono text-text-muted">
            <span>Navigation: ↑ ↓ | Select: Enter | Exit: Esc</span>
            <span>CYBERGUARD KBD</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
