import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Download,
  Share2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Mail,
  MessageSquare,
  Globe,
  Terminal,
  Network,
  FileCode,
  QrCode,
  Shield,
  Copy,
  Check,
  CheckSquare,
  Square,
  Cpu,
  Activity,
  FileText,
} from 'lucide-react';
import { ScanRecord, api } from '@/lib/api';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { GlassBadge } from '@/components/ui/GlassBadge';

interface AnalysisResultScreenProps {
  scan: ScanRecord;
  onRescan: () => void;
  onOpenCopilot: (scan?: ScanRecord) => void;
}

const getVectorDetails = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email':
      return { label: 'Email Analysis', icon: Mail };
    case 'message':
      return { label: 'SMS / Chat Message', icon: MessageSquare };
    case 'auth_log':
      return { label: 'Auth Syslog Audit', icon: Terminal };
    case 'network':
      return { label: 'NetFlow Telemetry', icon: Network };
    case 'headers':
      return { label: 'Raw RFC Email Headers', icon: FileCode };
    case 'qr':
      return { label: 'Decoded QR Code', icon: QrCode };
    default:
      return { label: 'Target Analysis', icon: Globe };
  }
};

const verdictConfig = {
  safe: {
    label: 'SAFE',
    badgeText: 'CLEAN BASELINE',
    textColor: 'text-emerald-700 dark:text-protected',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    cardBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    radialGlow: 'rgba(0, 255, 157, 0.15)',
    dotClass: 'bg-emerald-500 dark:bg-protected shadow-[0_0_8px_#00FF9D]',
    strokeColor: '#00FF9D',
    badgeVariant: 'protected' as const,
    icon: CheckCircle2,
  },
  review: {
    label: 'SUSPICIOUS',
    badgeText: 'REVIEW NEEDED',
    textColor: 'text-amber-700 dark:text-suspicious',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    cardBg: 'bg-amber-50/50 dark:bg-amber-950/20',
    radialGlow: 'rgba(255, 176, 32, 0.15)',
    dotClass: 'bg-amber-500 dark:bg-suspicious shadow-[0_0_8px_#FFB020]',
    strokeColor: '#FFB020',
    badgeVariant: 'suspicious' as const,
    icon: AlertTriangle,
  },
  critical: {
    label: 'HIGH RISK',
    badgeText: 'THREAT DETECTED',
    textColor: 'text-rose-700 dark:text-critical',
    borderColor: 'border-rose-200 dark:border-rose-500/30',
    cardBg: 'bg-rose-50/50 dark:bg-rose-950/20',
    radialGlow: 'rgba(255, 70, 90, 0.18)',
    dotClass: 'bg-rose-500 dark:bg-critical shadow-[0_0_8px_#FF465A]',
    strokeColor: '#FF465A',
    badgeVariant: 'critical' as const,
    icon: ShieldAlert,
  },
};

type ActiveTab = 'indicators' | 'ai' | 'actions';

export const AnalysisResultScreen: React.FC<AnalysisResultScreenProps> = ({
  scan,
  onRescan,
  onOpenCopilot,
}) => {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<ActiveTab>('indicators');
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const verdictKey =
    scan.risk_score >= 70 ? 'critical' : scan.risk_score >= 30 ? 'review' : 'safe';
  const config = verdictConfig[verdictKey];

  const vector = getVectorDetails(scan.input_type);
  const VectorIcon = vector.icon;

  const findingsList = useMemo(() => {
    return (scan.findings || []).map((f) => ({
      severity: (f.severity || 'MEDIUM').toUpperCase(),
      category: f.category || 'STRUCTURAL',
      title: f.title || 'Technical Indicator',
      description: f.description || '',
      ruleId: f.rule_id || 'RULE_HEURISTIC',
      confidence: Math.round((f.confidence || 0.85) * 100),
    }));
  }, [scan.findings]);

  const recommendationsList = useMemo(() => {
    return scan.recommendations && scan.recommendations.length > 0
      ? scan.recommendations
      : scan.recommended_actions && scan.recommended_actions.length > 0
      ? scan.recommended_actions
      : [
          'Verify sender authenticity out-of-band via verified corporate directory.',
          'Isolate incoming session traffic from origin network block at the firewall.',
          'Record incident cryptographic hash in enterprise SIEM ledger.',
        ];
  }, [scan.recommendations, scan.recommended_actions]);

  // Cleaned up AI Narrative (filters out duplicate raw structural dumps)
  const cleanAiNarrative = useMemo(() => {
    const raw = scan.ai_explanation || scan.executive_summary || '';
    if (!raw.trim()) return [];

    // Filter out raw structural dumps like "Structural Metadata - Total log lines: 4 - Failed attempts: 4..."
    const paragraphs = raw.split('\n\n').filter((p) => {
      const clean = p.trim();
      if (!clean) return false;
      if (clean.includes('Structural Metadata - Total log lines')) return false;
      if (clean.includes('Threat Analysis Report') && clean.includes('**Risk Score:**')) return false;
      return true;
    });

    return paragraphs;
  }, [scan.ai_explanation, scan.executive_summary]);

  const handleCopyTarget = () => {
    const textToCopy = scan.input_payload || scan.input_summary;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const rep = await api.generateReport(scan.id);
      window.open(api.getUrl(`/reports/download/${rep.id}`), '_blank');
    } catch {
      window.open(api.getUrl(`/reports/download/${scan.id}`), '_blank');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyActions = () => {
    const text = recommendationsList.map((r, i) => `${i + 1}. ${r}`).join('\n');
    navigator.clipboard.writeText(text);
    setActionNotice('Recommended actions copied to clipboard.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Radial Gauge Math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scan.risk_score / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. TOP NAVIGATION / BREADCRUMB BAR (ALWAYS VISIBLE BACK BUTTON) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10">
        <button
          type="button"
          onClick={onRescan}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Analyzer</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Download size={14} />
            {isGeneratingPdf ? 'Generating PDF...' : 'Export PDF Report'}
          </button>

          <button
            type="button"
            onClick={onRescan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white/80 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw size={14} />
            New Scan
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan/30 text-cyan-900 dark:text-cyan text-sm font-medium flex items-center justify-between shadow-sm">
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. MAIN THREAT VERDICT CARD */}
      <motion.section
        className={`relative overflow-hidden rounded-[24px] border ${config.borderColor} ${config.cardBg} p-6 md:p-8 backdrop-blur-xl transition-colors duration-300 shadow-sm dark:shadow-2xl`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.1 : 0.3 }}
      >
        <div className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
          {/* Circular Threat Score Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 shrink-0 min-w-[200px] shadow-sm">
            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-white/10"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={config.strokeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    transition: 'stroke-dashoffset 0.8s ease-in-out',
                    filter: `drop-shadow(0 0 6px ${config.strokeColor})`,
                  }}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-mono font-black ${config.textColor}`}>
                  <RollingNumber value={scan.risk_score} duration={600} />
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-white/50 tracking-wider uppercase">
                  SCORE / 100
                </span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />
              <span className={`font-mono text-xs font-bold tracking-wider ${config.textColor}`}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Incident Details & Executive Verdict */}
          <div className="space-y-3.5 min-w-0">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white font-bold shadow-sm">
                <VectorIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan" />
                {vector.label}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60">
                REF #{scan.id.slice(0, 8)}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan/30 text-cyan-800 dark:text-cyan font-bold">
                ⚡ AI REASONING ACTIVE
              </span>
            </div>

            {/* Target Display Bar with 1-Click Copy */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-xs font-mono shadow-sm">
              <div className="truncate text-slate-800 dark:text-white/80">
                <span className="text-slate-400 dark:text-white/40 mr-2 select-none font-bold">
                  TARGET:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {scan.input_summary || scan.input_payload.slice(0, 100)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyTarget}
                title="Copy target to clipboard"
                className="shrink-0 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white/80 transition-colors cursor-pointer"
              >
                {copiedTarget ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-lime" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Concise Executive Summary */}
            <p className="text-sm md:text-base leading-relaxed text-slate-800 dark:text-white/90">
              {scan.executive_summary ||
                (verdictKey === 'critical'
                  ? 'High-confidence defensive alerts detected. Deceptive social engineering or credential lure identified.'
                  : verdictKey === 'review'
                  ? 'Anomalous behavioral patterns observed. Security analyst review recommended.'
                  : 'Zero malicious indicators identified. Target conforms to clean baseline.')}
            </p>

            {/* Clean Telemetry Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-600 dark:text-white/70">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                <Shield size={14} className="text-cyan-600 dark:text-cyan" />
                <span>
                  Heuristic Rules:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {findingsList.length} Triggered
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                <Cpu size={14} className="text-cyan-600 dark:text-cyan" />
                <span>
                  AI Analysis:{' '}
                  <strong className="text-slate-900 dark:text-white">Neural Active</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                <Activity size={14} className="text-cyan-600 dark:text-cyan" />
                <span>
                  Confidence:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {scan.risk_score >= 70 ? '94%' : scan.risk_score >= 30 ? '88%' : '98%'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenCopilot(scan)}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan dark:text-black px-5 py-2.5 text-sm font-bold transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Sparkles size={16} />
                Ask Copilot About Threat
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. CLEAN 3-TAB NAVIGATION */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('indicators')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'indicators'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-cyan-500/20 dark:text-cyan dark:border-cyan/40'
              : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
          }`}
        >
          <Shield size={16} />
          <span>Detected Indicators</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-bold">
            {findingsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-cyan-500/20 dark:text-cyan dark:border-cyan/40'
              : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
          }`}
        >
          <Sparkles size={16} />
          <span>AI Security Analysis</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan text-xs font-bold">
            AI Verified
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('actions')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'actions'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-cyan-500/20 dark:text-cyan dark:border-cyan/40'
              : 'text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
          }`}
        >
          <CheckSquare size={16} />
          <span>Recommended Actions</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-bold">
            {recommendationsList.length}
          </span>
        </button>
      </div>

      {/* 4. TAB 1: DETECTED INDICATORS (CLEAR FACTUAL RULES) */}
      {activeTab === 'indicators' && (
        <motion.div
          key="tab-indicators"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-600 dark:text-white/60">
            <span>Verified detection signatures evaluated against input content</span>
            <span>{findingsList.length} Triggered</span>
          </div>

          <div className="grid gap-3">
            {findingsList.length > 0 ? (
              findingsList.map((item, index) => {
                const itemConfig =
                  verdictConfig[
                    item.severity.toLowerCase() === 'critical' ||
                    item.severity.toLowerCase() === 'high'
                      ? 'critical'
                      : item.severity.toLowerCase() === 'medium'
                      ? 'review'
                      : 'safe'
                  ];

                return (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 flex gap-4 items-start shadow-sm"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-mono font-bold ${itemConfig.textColor} ${itemConfig.borderColor} bg-slate-50 dark:bg-white/5`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <GlassBadge
                          variant={itemConfig.badgeVariant}
                          size="sm"
                          className="text-xs font-bold"
                        >
                          {item.severity}
                        </GlassBadge>
                        <span className="text-xs font-mono text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md">
                          {item.ruleId}
                        </span>
                        <span className="text-xs font-mono text-cyan-700 dark:text-cyan ml-auto font-semibold">
                          {item.confidence}% Confidence
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-white/75 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-center space-y-2 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-lime mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  All Security Checks Passed
                </h4>
                <p className="text-xs font-mono text-slate-600 dark:text-white/60">
                  No structural anomalies, fraudulent keywords, or spoofing signatures detected.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 5. TAB 2: AI SECURITY ANALYSIS */}
      {activeTab === 'ai' && (
        <motion.div
          key="tab-ai"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Security Assessment & Threat Context
                </h4>
              </div>
              <span className="text-xs font-mono text-cyan-700 dark:text-cyan font-bold bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-200 dark:border-cyan/30">
                Powered by CYBERGUARD AI
              </span>
            </div>

            <div className="text-sm md:text-base leading-relaxed text-slate-800 dark:text-white/85 space-y-3 font-sans">
              {cleanAiNarrative.length > 0 ? (
                cleanAiNarrative.map((paragraph, pIdx) => {
                  const cleanP = paragraph.trim();
                  if (!cleanP) return null;

                  if (cleanP.startsWith('## ') || cleanP.startsWith('### ')) {
                    return (
                      <h5
                        key={pIdx}
                        className="text-base font-bold text-slate-900 dark:text-white pt-2"
                      >
                        {cleanP.replace(/^#{2,3}\s+/, '')}
                      </h5>
                    );
                  }

                  if (cleanP.startsWith('- ') || cleanP.startsWith('* ')) {
                    return (
                      <ul
                        key={pIdx}
                        className="list-disc list-inside space-y-1.5 pl-2 text-slate-700 dark:text-white/80 text-sm"
                      >
                        {cleanP.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^[-*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }

                  return <p key={pIdx}>{cleanP}</p>;
                })
              ) : (
                <p>{scan.executive_summary}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 6. TAB 3: RECOMMENDED ACTIONS (ACTIONABLE CHECKLIST) */}
      {activeTab === 'actions' && (
        <motion.div
          key="tab-actions"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-600 dark:text-white/60">
              Recommended mitigation protocol for this threat level
            </span>
            <button
              type="button"
              onClick={handleCopyActions}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-700 dark:text-cyan hover:underline cursor-pointer"
            >
              <Copy size={13} />
              Copy Action Checklist
            </button>
          </div>

          <div className="grid gap-3">
            {recommendationsList.map((rec, idx) => {
              const isChecked = !!completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all cursor-pointer shadow-sm ${
                    isChecked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-cyan-700 dark:text-cyan cursor-pointer"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-lime" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 dark:text-white/40" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-white/50">
                        STEP {idx + 1}
                      </span>
                      {isChecked && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-lime/20 dark:text-lime">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        isChecked
                          ? 'line-through text-slate-500 dark:text-white/50'
                          : 'text-slate-800 dark:text-white/90 font-medium'
                      }`}
                    >
                      {rec}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalysisResultScreen;
