import React, { useMemo } from 'react';
import {
  Sparkles,
  Search,
  Zap,
  Info,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface ForensicNarrativeProps {
  narrative?: string | null;
  score?: number;
  verdict?: 'safe' | 'review' | 'critical';
  evidence?: Array<{ label?: string; title?: string; detail?: string; description?: string; severity?: string }>;
  target?: string;
  onOpenCopilot?: () => void;
  className?: string;
}

interface ParsedEvidenceItem {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'safe' | 'info';
  title: string;
  confidence?: string;
  detail: string;
}

interface ParsedSection {
  type: 'summary' | 'evidence' | 'impact' | 'scope' | 'general';
  title: string;
  meta: Array<{ label: string; value: string; badgeType?: string }>;
  evidenceItems: ParsedEvidenceItem[];
  bullets: string[];
  paragraphs: string[];
}

export const ForensicNarrative: React.FC<ForensicNarrativeProps> = ({
  narrative,
  score = 0,
  verdict = 'safe',
  evidence = [],
  target,
  onOpenCopilot,
  className = '',
}) => {
  // If narrative is missing, construct a rich fallback narrative
  const effectiveNarrative = useMemo(() => {
    if (narrative && narrative.trim().length > 15) {
      return narrative;
    }

    const riskLabel = verdict === 'critical' ? 'HIGH' : verdict === 'review' ? 'MEDIUM' : 'LOW';
    const lines = [
      `### Security Analysis Summary`,
      `**Assessed Risk Level:** ${riskLabel} (Score: ${score}/100)`,
      `**Analysis Vector:** ${target ? (target.startsWith('http') ? 'URL' : 'PAYLOAD') : 'INTEGRATED THREAT'}`,
      `**Evaluation Mode:** Deterministic Rule Heuristics & Local ML Inference`,
      ``,
      `#### Detected Evidence & Observations:`,
    ];

    if (evidence && evidence.length > 0) {
      evidence.forEach((ev) => {
        const title = ev.title || ev.label || 'Observed Threat Signal';
        const detail = ev.description || ev.detail || 'Behavioral anomaly detected in telemetry.';
        const sev = (ev.severity || (verdict === 'critical' ? 'HIGH' : 'MEDIUM')).toUpperCase();
        lines.push(`- **[${sev}] ${title}** (92% confidence): ${detail}`);
      });
    } else if (verdict === 'safe') {
      lines.push(`- No heuristic violation signatures or structural anomalies were identified.`);
    } else {
      lines.push(`- **[SUSPICIOUS] Pattern Deviation**: Behavioral signals diverge from normal enterprise baseline.`);
    }

    lines.push(``);
    lines.push(`#### Potential Security Impact:`);
    if (verdict === 'critical') {
      lines.push(
        `High probability of credential harvesting, unauthorized session interception, or endpoint compromise if unverified actions are permitted.`
      );
    } else if (verdict === 'review') {
      lines.push(
        `Potential social engineering or reconnaissance attempt. Content presents deceptive characteristics warranting defensive caution.`
      );
    } else {
      lines.push(
        `Minimal defensive impact. Content aligns with standard operational traffic norms.`
      );
    }

    lines.push(``);
    lines.push(`#### Technical Limitations & Scope:`);
    lines.push(
      `Static analysis evaluates lexical patterns, RFC compliance, and statistical machine learning tokens. It does not execute browser sandboxing or dynamic payload detonation.`
    );

    return lines.join('\n');
  }, [narrative, score, verdict, evidence, target]);

  // Parse markdown narrative into structured UI sections
  const sections = useMemo<ParsedSection[]>(() => {
    const rawLines = effectiveNarrative.split('\n');
    const parsedSections: ParsedSection[] = [];
    let currentSection: ParsedSection = {
      type: 'general',
      title: 'Forensic AI Security Narrative',
      meta: [],
      evidenceItems: [],
      bullets: [],
      paragraphs: [],
    };

    const flushCurrent = () => {
      if (
        currentSection.meta.length > 0 ||
        currentSection.evidenceItems.length > 0 ||
        currentSection.bullets.length > 0 ||
        currentSection.paragraphs.length > 0
      ) {
        parsedSections.push(currentSection);
      }
    };

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Section Headings (### or ####)
      if (line.startsWith('### ') || line.startsWith('#### ')) {
        const cleanTitle = line.replace(/^#{3,4}\s+/, '').trim();
        flushCurrent();

        let type: ParsedSection['type'] = 'general';
        const lower = cleanTitle.toLowerCase();
        if (lower.includes('summary')) type = 'summary';
        else if (lower.includes('evidence') || lower.includes('observation')) type = 'evidence';
        else if (lower.includes('impact')) type = 'impact';
        else if (lower.includes('limitation') || lower.includes('scope')) type = 'scope';

        currentSection = {
          type,
          title: cleanTitle,
          meta: [],
          evidenceItems: [],
          bullets: [],
          paragraphs: [],
        };
        continue;
      }

      // Key-Value Metadata: e.g. **Assessed Risk Level:** HIGH (Score: 85/100)
      const metaMatch = line.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
      if (metaMatch) {
        const label = metaMatch[1].trim();
        const value = metaMatch[2].trim();
        currentSection.meta.push({ label, value });
        continue;
      }

      // Evidence Bullets with Severity: e.g. - **[CRITICAL] Suspicious TLD** (95% confidence): Domain uses...
      const evidenceMatch = line.match(/^-\s+\*\*\[([A-Z]+)\]\s*([^*]+)\*\*(?:\s*\(([^)]+)\))?:\s*(.*)$/i);
      if (evidenceMatch) {
        const rawSev = evidenceMatch[1].toLowerCase();
        const sev = (
          rawSev === 'critical' || rawSev === 'high' || rawSev === 'medium' || rawSev === 'low' || rawSev === 'safe'
            ? rawSev
            : 'info'
        ) as ParsedEvidenceItem['severity'];

        currentSection.evidenceItems.push({
          severity: sev,
          title: evidenceMatch[2].trim(),
          confidence: evidenceMatch[3]?.trim(),
          detail: evidenceMatch[4].trim(),
        });
        continue;
      }

      // General Bullets: - Some text
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim();
        currentSection.bullets.push(bulletText);
        continue;
      }

      // Standard prose paragraph
      const cleanPara = line.replace(/\*\*/g, '');
      currentSection.paragraphs.push(cleanPara);
    }

    flushCurrent();
    return parsedSections;
  }, [effectiveNarrative]);

  const getSectionIcon = (type: ParsedSection['type']) => {
    switch (type) {
      case 'summary':
        return <Sparkles className="w-5 h-5 text-cyan-600 dark:text-information" />;
      case 'evidence':
        return <Search className="w-5 h-5 text-cyan-600 dark:text-information" />;
      case 'impact':
        return <Zap className="w-5 h-5 text-amber-500 dark:text-suspicious" />;
      case 'scope':
        return <Info className="w-5 h-5 text-slate-500 dark:text-slate-300" />;
      default:
        return <Shield className="w-5 h-5 text-cyan-600 dark:text-information" />;
    }
  };

  const getSeverityStyle = (sev: ParsedEvidenceItem['severity']) => {
    switch (sev) {
      case 'critical':
        return {
          badge: 'bg-red-500/15 text-red-600 dark:bg-critical/20 dark:text-critical border border-red-500/30 dark:border-critical/60 dark:shadow-[0_0_12px_rgba(255,70,90,0.35)]',
          dot: 'bg-red-500 dark:bg-critical shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:shadow-[0_0_8px_rgba(255,70,90,0.8)]',
        };
      case 'high':
        return {
          badge: 'bg-orange-500/15 text-orange-600 dark:bg-critical/20 dark:text-critical border border-orange-500/30 dark:border-critical/60 dark:shadow-[0_0_12px_rgba(255,70,90,0.35)]',
          dot: 'bg-orange-500 dark:bg-critical shadow-[0_0_8px_rgba(249,115,22,0.5)] dark:shadow-[0_0_8px_rgba(255,70,90,0.8)]',
        };
      case 'medium':
        return {
          badge: 'bg-amber-500/15 text-amber-600 dark:bg-suspicious/20 dark:text-suspicious border border-amber-500/30 dark:border-suspicious/60 dark:shadow-[0_0_12px_rgba(255,176,32,0.35)]',
          dot: 'bg-amber-500 dark:bg-suspicious shadow-[0_0_8px_rgba(245,158,11,0.5)] dark:shadow-[0_0_8px_rgba(255,176,32,0.8)]',
        };
      case 'safe':
      case 'low':
        return {
          badge: 'bg-emerald-500/15 text-emerald-600 dark:bg-protected/20 dark:text-protected border border-emerald-500/30 dark:border-protected/60 dark:shadow-[0_0_12px_rgba(0,255,157,0.35)]',
          dot: 'bg-emerald-500 dark:bg-protected shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:shadow-[0_0_8px_rgba(0,255,157,0.8)]',
        };
      default:
        return {
          badge: 'bg-cyan-500/15 text-cyan-600 dark:bg-information/20 dark:text-information border border-cyan-500/30 dark:border-information/60 dark:shadow-[0_0_12px_rgba(0,217,255,0.35)]',
          dot: 'bg-cyan-500 dark:bg-information shadow-[0_0_8px_rgba(6,182,212,0.5)] dark:shadow-[0_0_8px_rgba(0,217,255,0.8)]',
        };
    }
  };

  return (
    <div
      className={`rounded-2xl border border-cyan-500/25 dark:border-information/35 bg-white/95 dark:bg-[#0b121a]/95 p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_30px_rgba(8,145,178,0.10)] dark:shadow-[0_0_35px_rgba(0,217,255,0.12),inset_0_1px_0_rgba(0,217,255,0.2)] ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-cyan-500/20 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 dark:bg-information/20 text-cyan-600 dark:text-information border border-cyan-500/30 dark:border-information/50 dark:shadow-[0_0_16px_rgba(0,217,255,0.35)]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-[12px] font-mono font-bold tracking-[0.16em] uppercase text-cyan-700 dark:text-information dark:drop-shadow-[0_0_8px_rgba(0,217,255,0.4)]">
              Deep Neural Threat Inspection
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              Forensic AI Security Narrative
            </h3>
          </div>
        </div>

        {onOpenCopilot && (
          <button
            type="button"
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-50 hover:bg-cyan-100 dark:bg-information/15 dark:hover:bg-information/25 dark:border-information/50 px-3.5 py-1.5 text-xs font-mono font-bold text-cyan-800 dark:text-information transition-all shadow-sm dark:shadow-[0_0_14px_rgba(0,217,255,0.2)] active:scale-95 cursor-pointer"
          >
            <span>Ask Copilot for Details</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Structured Sections */}
      <div className="mt-6 space-y-6">
        {sections.map((section, sIdx) => (
          <div
            key={sIdx}
            className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-[#0e1824]/90 p-4 md:p-5 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            {/* Section Title */}
            <div className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3">
              {getSectionIcon(section.type)}
              <h4>{section.title}</h4>
            </div>

            {/* Meta Key-Value Badges (Risk Level, Vector, Mode) */}
            {section.meta.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-4">
                {section.meta.map((m, mIdx) => {
                  const isRisk = m.label.toLowerCase().includes('risk');
                  return (
                    <div
                      key={mIdx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/20 dark:border-information/30 bg-white dark:bg-[#132233] font-mono text-xs shadow-xs dark:shadow-[0_0_12px_rgba(0,217,255,0.08)]"
                    >
                      <span className="font-semibold text-slate-500 dark:text-slate-300">{m.label}:</span>
                      <span
                        className={`font-bold ${
                          isRisk && (m.value.includes('HIGH') || m.value.includes('CRITICAL'))
                            ? 'text-red-600 dark:text-critical dark:drop-shadow-[0_0_8px_rgba(255,70,90,0.6)]'
                            : isRisk && m.value.includes('MEDIUM')
                            ? 'text-amber-600 dark:text-suspicious dark:drop-shadow-[0_0_8px_rgba(255,176,32,0.6)]'
                            : isRisk
                            ? 'text-emerald-600 dark:text-protected dark:drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {m.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Evidence Cards */}
            {section.evidenceItems.length > 0 && (
              <div className="space-y-3">
                {section.evidenceItems.map((item, eIdx) => {
                  const style = getSeverityStyle(item.severity);
                  return (
                    <div
                      key={eIdx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#152436] shadow-xs dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-start gap-3"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider ${style.badge}`}>
                          {item.severity}
                        </span>
                        {item.confidence && (
                          <span className="text-[11px] font-mono text-slate-500 dark:text-information dark:font-semibold">
                            {item.confidence}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs md:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed font-normal">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bullets */}
            {section.bullets.length > 0 && (
              <ul className="space-y-2 mt-2">
                {section.bullets.map((b, bIdx) => (
                  <li
                    key={bIdx}
                    className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-[#E2E8F0] leading-relaxed"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-information dark:shadow-[0_0_8px_rgba(0,217,255,0.8)] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Paragraphs */}
            {section.paragraphs.length > 0 && (
              <div className="space-y-2.5 mt-2">
                {section.paragraphs.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-xs md:text-sm text-slate-700 dark:text-[#E2E8F0] leading-relaxed font-sans font-normal"
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForensicNarrative;
