import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Shield,
  Sparkles,
  Layers,
  ArrowRight,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { SpotlightCard } from '@/components/magicui/SpotlightCard';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { api, ScanRecord, ScanSummaryItem } from '@/lib/api';

interface CopilotMessage {
  id: string;
  sender: 'analyst' | 'assistant';
  content: string;
  timestamp: Date;
  evidenceReferences?: string[];
  recommendations?: string[];
  riskScore?: number;
  source?: string;
}

export const AICopilotPage: React.FC = () => {
  const [scans, setScans] = useState<ScanSummaryItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string>('');
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Welcome, Security Analyst. I am your CYBERGUARD Defensive Copilot. I can explain the mechanics of any detected threat vector, interrogate itemized evidence tokens, calculate risk implications, and formulate SOC response playbooks.',
      timestamp: new Date(),
    },
  ]);

  // Load available scans for context-aware interrogation
  useEffect(() => {
    api.getScans({ limit: 15 })
      .then((res) => {
        setScans(res.items);
        if (res.items.length > 0) {
          setSelectedScanId(res.items[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // When selected scan changes, fetch full details
  useEffect(() => {
    if (selectedScanId) {
      api.getScan(selectedScanId)
        .then((full) => {
          setSelectedScan(full);
          // Insert a context shift message
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              sender: 'assistant',
              content: `Active inspection context linked to Scan #${full.id.slice(0, 8)} (${full.input_type.toUpperCase()} • Score ${full.risk_score}/100 • ${full.risk_level}). You can now ask me to explain why this was flagged or break down its specific evidence.`,
              timestamp: new Date(),
              riskScore: full.risk_score,
              evidenceReferences: (full.findings || []).map((f) => f.title),
            },
          ]);
        })
        .catch(console.error);
    }
  }, [selectedScanId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    const userMsg: CopilotMessage = {
      id: String(Date.now()),
      sender: 'analyst',
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.chatCopilot(query, selectedScan?.id, conversationId);
      setConversationId(res.conversation_id);

      const assistantMsg: CopilotMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: res.response,
        timestamp: new Date(),
        source: res.source,
        riskScore: selectedScan?.risk_score,
        evidenceReferences: (selectedScan?.findings || []).map((f) => f.title).slice(0, 3),
        recommendations: selectedScan?.recommendations?.slice(0, 2),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          content: 'Unable to query the defense copilot engine. Please verify the backend service status.',
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
        content: 'Conversation history reset. Ready for new incident interrogation.',
        timestamp: new Date(),
      },
    ]);
    setConversationId(undefined);
  };

  return (
    <div className="dashboard animate-in fade-in duration-200">
      {/* V0 Page Header */}
      <header className="page-head">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles className="w-3.5 h-3.5 text-[var(--cyan)]" /> AI SECURITY COPILOT
          </div>
          <h1>Security analyst, on call.</h1>
          <p>
            Ask about the active assessment and get evidence-backed next steps.
          </p>
        </div>

        {/* Scan Context Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#718590] uppercase font-bold shrink-0">
            Active Context:
          </span>
          <select
            value={selectedScanId}
            onChange={(e) => setSelectedScanId(e.target.value)}
            className="text-input"
            style={{ height: '38px', padding: '6px 12px', fontSize: '12px', maxWidth: '280px', borderRadius: '6px' }}
          >
            <option value="">No Active Scan (General Defense Mode)</option>
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.input_type.toUpperCase()}] {s.input_summary.slice(0, 28)}... (Score: {s.risk_score})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* V0 Copilot Hero / Context Panel */}
      <section className="panel copilot-panel" style={{ margin: '24px 0', textAlign: 'center' }}>
        {selectedScan ? (
          <div className="copilot-context" style={{ textAlign: 'left' }}>
            <div className="eyebrow">CURRENT ANALYSIS</div>
            <strong>
              {selectedScan.input_type.toUpperCase()} &bull; {selectedScan.risk_level} RISK &bull; {selectedScan.risk_score}
            </strong>
            <span>
              {selectedScan.findings?.length || 0} indicators detected &bull; Latency {selectedScan.processing_time_ms}ms
            </span>
          </div>
        ) : (
          <div className="copilot-context" style={{ textAlign: 'left' }}>
            <div className="eyebrow">GENERAL DEFENSE MODE</div>
            <strong>CYBERGUARD KNOWLEDGE BASE ACTIVE</strong>
            <span>Select an analyzed threat above or ask general defensive questions.</span>
          </div>
        )}

        <div className="copilot-orb">
          <Bot />
        </div>

        <div className="eyebrow" style={{ justifyContent: 'center', margin: '14px 0 6px' }}>
          CYBERGUARD SECURITY ANALYST
        </div>
        <h2 style={{ fontSize: '26px', margin: '4px 0 10px' }}>What should we investigate?</h2>
        <p style={{ color: '#82959e', fontSize: '14px', maxWidth: '580px', margin: '0 auto 20px' }}>
          I can explain the strongest evidence, compare signals, or recommend a safe response.
        </p>

        {/* V0 Copilot Prompts */}
        <div className="copilot-prompts" style={{ justifyContent: 'center' }}>
          <button onClick={() => handleSend('Why was this flagged by the analysis engine?')}>
            Why was this flagged?
          </button>
          <button onClick={() => handleSend('Show the strongest evidence indicators and why they are dangerous.')}>
            Show strongest evidence
          </button>
          <button onClick={() => handleSend('What should the SOC team do next to contain this threat?')}>
            What should I do next?
          </button>
        </div>
      </section>

      {/* Main Conversation Stream */}
      <section className="panel" style={{ padding: '24px' }}>
        <div className="panel-head" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div className="eyebrow">INVESTIGATION THREAD</div>
            <h2>Conversational Reasoning</h2>
          </div>
          <button
            onClick={handleClear}
            className="select"
            style={{ cursor: 'pointer' }}
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1 text-[var(--red)]" /> Clear Thread
          </button>
        </div>
        <div className="overflow-y-auto space-y-4 pr-2" style={{ maxHeight: '520px', margin: '20px 0' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'analyst' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-2xl text-base leading-relaxed ${
                  m.sender === 'analyst'
                    ? 'bg-[rgba(0,217,255,0.15)] border border-[rgba(0,217,255,0.4)] text-[#e8f3f6] rounded-br-sm'
                    : 'panel border border-[rgba(148,185,202,0.16)] text-[#e8f3f6] rounded-bl-sm space-y-3'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-mono text-[#718590]">
                  {m.sender === 'assistant' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[var(--cyan)]" />
                      <span className="font-bold text-[var(--cyan)]">CYBERGUARD Copilot</span>
                      {m.source && (
                        <span className="px-1.5 py-0.2 rounded bg-[rgba(7,20,27,0.6)] border border-[rgba(148,185,202,0.16)] text-[10px]">
                          {m.source}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Security Analyst</span>
                  )}
                  <span>&bull;</span>
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">
                  {m.content}
                </div>

                {/* Grounded Evidence Citations */}
                {m.evidenceReferences && m.evidenceReferences.length > 0 && (
                  <div className="pt-2 border-t border-[rgba(148,185,202,0.16)] space-y-1.5">
                    <span className="text-xs font-mono font-bold text-[var(--cyan)] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Grounded Evidence Citations:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.evidenceReferences.map((ev, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-[rgba(7,20,27,0.6)] border border-[rgba(148,185,202,0.16)] text-[#91a7af]"
                        >
                          &bull; {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                {m.recommendations && m.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-[rgba(148,185,202,0.16)] space-y-1">
                    <span className="text-xs font-mono font-bold text-[var(--lime)] flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Recommended SOC Actions:</span>
                    </span>
                    {m.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs text-[#91a7af] flex items-start gap-1.5">
                        <span className="text-[var(--lime)] font-bold">&rarr;</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="panel p-4 rounded-2xl rounded-bl-sm border border-[rgba(148,185,202,0.16)] flex items-center gap-2 text-[#91a7af]">
                <span className="animate-spin w-4 h-4 border-2 border-[var(--cyan)] border-t-transparent rounded-full" />
                <span className="text-sm font-mono">Analyzing evidence telemetry & synthesizing reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-[rgba(148,185,202,0.16)] space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="copilot-input flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedScan
                    ? `Ask copilot about ${selectedScan.input_type} threat evidence or risk breakdown...`
                    : 'Ask defensive cybersecurity questions...'
                }
                disabled={isLoading}
              />
              <button
                type="submit"
                className="button primary"
                disabled={!input.trim() || isLoading}
                style={{ padding: '8px 16px', borderRadius: '4px' }}
              >
                <Send className="w-4 h-4 mr-1" /> Send
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between text-xs font-mono text-[#718590] px-1 mt-2">
            <span>Powered by CYBERGUARD AI &bull; Deterministic Verification</span>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 hover:text-[var(--red)] transition-colors cursor-pointer bg-none border-0 text-[#718590]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Conversation</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

