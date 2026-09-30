import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import {
  Bot,
  Send,
  Trash2,
  Shield,
  Sparkles,
  X,
  Minus,
  Maximize2,
  Minimize2,
  GripHorizontal,
  ArrowRight,
  Move,
  CornerDownRight,
} from 'lucide-react';
import { api, ScanRecord } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  source?: string;
  timestamp: Date;
}

interface CyberGuardAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  activeScan?: ScanRecord | null;
}

type SizePreset = 'compact' | 'standard' | 'expanded';

const PRESETS: Record<SizePreset, { width: number; height: number }> = {
  compact: { width: 380, height: 520 },
  standard: { width: 480, height: 640 },
  expanded: { width: 760, height: 800 },
};

export const CyberGuardAIChatbot: React.FC<CyberGuardAIChatbotProps> = ({
  isOpen,
  onClose,
  onOpen,
  activeScan,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [sizePreset, setSizePreset] = useState<SizePreset>('standard');
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return {
        width: Math.min(window.innerWidth - 20, 390),
        height: Math.min(window.innerHeight - 80, 540),
      };
    }
    return { width: 480, height: 640 };
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content:
        'Hello Analyst. I am the **CYBERGUARD AI** defensive intelligence agent. You can ask me to evaluate threat signatures, explain forensic evidence, or recommend incident containment protocols.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastLinkedScanIdRef = useRef<string | null>(null);

  // Motion drag controls for moving anywhere on screen
  const dragControls = useDragControls();

  // Resize state
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0, startW: 0, startH: 0 });

  // Responsive boundary safety check on mount and resize
  useEffect(() => {
    const handleWindowResize = () => {
      setDimensions((prev) => ({
        width: Math.min(prev.width, window.innerWidth - 32),
        height: Math.min(prev.height, window.innerHeight - 32),
      }));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Link scan context dynamically whenever activeScan changes
  useEffect(() => {
    if (activeScan && activeScan.id !== lastLinkedScanIdRef.current) {
      lastLinkedScanIdRef.current = activeScan.id;
      setMessages((prev) => [
        ...prev,
        {
          id: `scan-${Date.now()}`,
          sender: 'assistant',
          content: `🎯 **Inspection context linked**: ${activeScan.input_type.toUpperCase()} (#${activeScan.id.slice(0, 8)})\n• **Risk Score**: ${activeScan.risk_score}/100 (${activeScan.risk_level})\n• **Summary**: ${activeScan.input_summary || activeScan.input_payload.slice(0, 60)}\n\nAsk me why this was flagged or for a recommended mitigation playbook.`,
          timestamp: new Date(),
        },
      ]);
      if (!isOpen && onOpen) {
        onOpen();
      }
    }
  }, [activeScan?.id, isOpen, onOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isMinimized]);

  // Corner Drag-to-Resize Handler
  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        startW: dimensions.width,
        startH: dimensions.height,
      };

      const handlePointerMove = (ev: PointerEvent) => {
        if (!isResizingRef.current) return;
        // Resizing from top-left (since docked bottom-right)
        const deltaX = startPosRef.current.x - ev.clientX;
        const deltaY = startPosRef.current.y - ev.clientY;

        const maxW = Math.min(window.innerWidth - 40, 1100);
        const maxH = Math.min(window.innerHeight - 40, 950);
        const minW = 360;
        const minH = 440;

        const newW = Math.min(maxW, Math.max(minW, startPosRef.current.startW + deltaX));
        const newH = Math.min(maxH, Math.max(minH, startPosRef.current.startH + deltaY));

        setDimensions({ width: newW, height: newH });
        setIsMaximized(false);
      };

      const handlePointerUp = () => {
        isResizingRef.current = false;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [dimensions]
  );

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore to preset
      setDimensions(PRESETS[sizePreset]);
      setIsMaximized(false);
    } else {
      // Maximize
      setDimensions({
        width: Math.min(window.innerWidth - 40, 960),
        height: Math.min(window.innerHeight - 40, 880),
      });
      setIsMaximized(true);
    }
  };

  const handleApplyPreset = (preset: SizePreset) => {
    setSizePreset(preset);
    setIsMaximized(false);
    setDimensions({
      width: Math.min(PRESETS[preset].width, window.innerWidth - 32),
      height: Math.min(PRESETS[preset].height, window.innerHeight - 32),
    });
  };

  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || input).trim();
    if (!query || isLoading) return;

    if (!customQuery) {
      setInput('');
    }

    const newMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const res = await api.chatCopilot(query, activeScan?.id, conversationId);
      setConversationId(res.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          content: res.response,
          source: res.source,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          content:
            'Unable to communicate with the defense engine. Please verify the backend service is running and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: String(Date.now()),
        sender: 'assistant',
        content: 'Conversation history reset. Ready for new security inquiries.',
        timestamp: new Date(),
      },
    ]);
    setConversationId(undefined);
  };

  // Helper to render bold and lists cleanly in messages
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 font-sans leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const cleanText = line.replace(/^[•-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 mt-2 shrink-0" />
                <span>{parseBold(cleanText)}</span>
              </div>
            );
          }

          return <div key={idx}>{parseBold(line)}</div>;
        })}
      </div>
    );
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Minimized or Closed Floating Launcher Button (Also Draggable!) */}
      {(!isOpen || isMinimized) && (
        <motion.div
          drag
          dragMomentum={false}
          className="fixed bottom-5 right-5 z-50 cursor-grab active:cursor-grabbing"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.04 }}
        >
          <button
            type="button"
            onClick={() => {
              if (!isOpen && onOpen) {
                onOpen();
              }
              setIsMinimized(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-full border border-cyan-500/40 bg-white/95 dark:bg-[#0B121A]/95 text-slate-900 dark:text-white shadow-[0_8px_30px_rgba(8,145,178,0.25)] dark:shadow-[0_0_30px_rgba(0,217,255,0.25)] backdrop-blur-md cursor-pointer group select-none"
            aria-label="Open CYBERGUARD AI Chatbot"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 dark:bg-cyan-400/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black animate-pulse" />
            </div>
            <div className="text-left font-sans">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                CYBERGUARD AI
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Drag anywhere • Click to open
              </div>
            </div>
          </button>
        </motion.div>
      )}

      {/* Main Draggable & Resizable Chatbot Screen Pop-Up */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-50 flex flex-col rounded-2xl border border-cyan-500/35 dark:border-cyan-400/35 bg-white/95 dark:bg-[#080E16]/95 backdrop-blur-2xl shadow-[0_16px_50px_rgba(8,145,178,0.22),0_0_2px_1px_rgba(8,145,178,0.25)] dark:shadow-[0_0_45px_rgba(0,217,255,0.18),inset_0_1px_0_rgba(0,217,255,0.25)] overflow-hidden"
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              maxWidth: 'calc(100vw - 16px)',
              maxHeight: 'calc(100vh - 16px)',
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Top-Left Corner Resize Handle */}
            <div
              onPointerDown={handleResizeStart}
              className="absolute top-0 left-0 w-5 h-5 cursor-nwse-resize z-50 flex items-center justify-center text-cyan-500/40 hover:text-cyan-500 group transition-colors"
              title="Drag corner to resize chatbot window"
            >
              <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-current rounded-tl-sm" />
            </div>

            {/* Draggable Pop-Up Header Bar */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 dark:border-white/10 bg-cyan-50/70 dark:bg-white/[0.03] cursor-grab active:cursor-grabbing select-none"
              title="Click and drag to move chatbot anywhere on screen"
            >
              <div className="flex items-center gap-2.5 pl-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 dark:bg-cyan-400/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(8,145,178,0.2)]">
                  <Bot size={18} />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans text-xs md:text-sm font-black tracking-wide text-slate-950 dark:text-white">
                      CYBERGUARD AI
                    </h3>
                    <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                      DRAGGABLE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>DEFENSE BOT ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Header Action Controls */}
              <div
                className="flex items-center gap-1"
                onPointerDown={(e) => e.stopPropagation()} // Stop drag when clicking buttons
              >
                {/* Size Presets Toggle Dropdown / Buttons */}
                <div className="hidden sm:flex items-center rounded-lg border border-cyan-500/20 dark:border-white/10 p-0.5 bg-white/70 dark:bg-black/30 mr-1 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('compact')}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      sizePreset === 'compact' && !isMaximized
                        ? 'bg-cyan-500 text-[#08090C] font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'
                    }`}
                    title="Compact Size (380x520)"
                  >
                    S
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('standard')}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      sizePreset === 'standard' && !isMaximized
                        ? 'bg-cyan-500 text-[#08090C] font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'
                    }`}
                    title="Standard Size (480x640)"
                  >
                    M
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('expanded')}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      sizePreset === 'expanded' && !isMaximized
                        ? 'bg-cyan-500 text-[#08090C] font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'
                    }`}
                    title="Expanded Size (760x800)"
                  >
                    L
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleMaximize}
                  title={isMaximized ? 'Restore Size' : 'Maximize Size'}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="Minimize chat"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Minus size={15} />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Context Header Banner if linked to a scan */}
            {activeScan && (
              <div className="px-4 py-2 bg-cyan-500/10 dark:bg-[#101b26] border-b border-cyan-500/20 text-xs font-mono flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-300">
                  <Shield size={14} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="truncate">
                    {activeScan.input_type.toUpperCase()}: {activeScan.input_summary?.slice(0, 24) || activeScan.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-bold ${
                      activeScan.risk_score >= 70
                        ? 'text-red-600 dark:text-red-400'
                        : activeScan.risk_score >= 30
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {activeScan.risk_score}/100 ({activeScan.risk_level})
                  </span>
                </div>
              </div>
            )}

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pr-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-cyan-600/15 border border-cyan-500/40 text-slate-900 dark:text-white rounded-br-xs'
                        : 'bg-slate-100/90 dark:bg-[#121E2C] border border-slate-200/90 dark:border-cyan-500/20 text-slate-800 dark:text-[#E2E8F0] rounded-bl-xs'
                    }`}
                  >
                    {/* Message Sender Header */}
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-mono">
                      {m.sender === 'assistant' ? (
                        <>
                          <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="font-bold text-cyan-700 dark:text-cyan-400">CYBERGUARD AI</span>
                          {m.source && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 text-[9px] font-mono border border-cyan-500/20">
                              {m.source}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-bold text-slate-600 dark:text-slate-400">Security Analyst</span>
                      )}
                    </div>

                    {/* Content */}
                    <div>{renderMessageContent(m.content)}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start">
                  <div className="p-3.5 rounded-2xl rounded-bl-xs bg-slate-100/90 dark:bg-[#121E2C] border border-slate-200 dark:border-cyan-500/20 flex items-center gap-2.5 text-xs font-mono text-cyan-700 dark:text-cyan-400 shadow-xs">
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    <span>Neural defense engine evaluating signals...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-cyan-500/15 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-wrap gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSend(undefined, 'Why was this flagged as a threat?')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-cyan-500/20 hover:border-cyan-500/50 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer"
              >
                🔍 Why flagged?
              </button>
              <button
                type="button"
                onClick={() => handleSend(undefined, 'What is the recommended containment playbook?')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-cyan-500/20 hover:border-cyan-500/50 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer"
              >
                🛡️ Containment action
              </button>
              <button
                type="button"
                onClick={() => handleSend(undefined, 'Summarize forensic evidence in simple terms')}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-cyan-500/20 hover:border-cyan-500/50 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer"
              >
                📋 Explain evidence
              </button>
            </div>

            {/* Input Bar Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-cyan-500/20 dark:border-white/10 bg-white dark:bg-[#0A1018] shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask CYBERGUARD AI about threats, evidence, or playbooks..."
                  disabled={isLoading}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-cyan-500/25 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-sans"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#08090C] font-bold shadow-[0_0_15px_rgba(8,145,178,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                  title="Send query"
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1">
                <span>DRAGGABLE & RESIZABLE WINDOW</span>
                <span>CYBERGUARD NEURAL INTEL</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CyberGuardAIChatbot;
