import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, Shield, Sparkles } from 'lucide-react';
import { GlassDrawer } from '@/components/ui/GlassModal';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { api, ScanRecord } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  source?: string;
  timestamp: Date;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScan?: ScanRecord | null;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  activeScan,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      content:
        'Hello Analyst. I am your CYBERGUARD Defensive Copilot. Ask me to demystify detected indicators, clarify risk scores, or recommend SOC containment actions.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const newMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      content: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const res = await api.chatCopilot(userText, activeScan?.id, conversationId);
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
          content: 'Unable to communicate with the defense copilot engine. Please ensure the backend service is running.',
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
        content: 'Conversation history cleared. Ready for new queries.',
        timestamp: new Date(),
      },
    ]);
    setConversationId(undefined);
  };

  return (
    <GlassDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="AI Security Copilot"
      subtitle={
        activeScan
          ? `Linked to Active Scan: ${activeScan.input_summary.slice(0, 30)}...`
          : 'General Defensive Intelligence Advisor'
      }
      width="lg"
    >
      <div className="flex flex-col h-[calc(100vh-170px)] justify-between">
        {/* Active scan indicator banner if linked */}
        {activeScan && (
          <div className="mb-4 p-3 rounded-xl bg-surface-glass border border-information/30 text-xs font-mono text-text-secondary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-information" />
              <span>Target: {activeScan.input_type.toUpperCase()}</span>
            </div>
            <span className="font-bold text-information">
              SCORE: {activeScan.risk_score}/100 ({activeScan.risk_level})
            </span>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-2xl text-base leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-information/20 border border-information/40 text-text-primary rounded-br-sm'
                    : 'glass-card border border-border text-text-primary rounded-bl-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-text-muted">
                  {m.sender === 'assistant' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-information" />
                      <span className="font-bold text-information">CYBERGUARD Copilot</span>
                      {m.source && (
                        <span className="px-1.5 py-0.2 rounded bg-surface-glass border border-border text-[10px]">
                          {m.source}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Security Analyst</span>
                  )}
                </div>
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="glass-card p-4 rounded-2xl rounded-bl-sm border border-border flex items-center gap-2 text-text-secondary">
                <span className="animate-spin w-4 h-4 border-2 border-information border-t-transparent rounded-full" />
                <span className="text-sm font-mono">Analyzing telemetry & formulating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-border space-y-2">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <GlassInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask copilot about evidence, risk or actions..."
              className="h-11 text-sm font-sans"
              disabled={isLoading}
            />
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              disabled={!input.trim() || isLoading}
              icon={<Send className="w-4 h-4" />}
            />
          </form>

          <div className="flex items-center justify-between text-xs font-mono text-text-muted px-1">
            <span>Powered by Server-Side Groq / Local Heuristics</span>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 hover:text-critical transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Thread</span>
            </button>
          </div>
        </div>
      </div>
    </GlassDrawer>
  );
};
