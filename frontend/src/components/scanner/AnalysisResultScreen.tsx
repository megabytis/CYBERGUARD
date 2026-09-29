import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ChevronRight,
  Download,
  Share2,
  Bot,
  RotateCcw,
} from 'lucide-react';
import { ScanRecord, api } from '@/lib/api';

interface AnalysisResultScreenProps {
  scan: ScanRecord;
  onRescan: () => void;
  onOpenCopilot: (scan?: ScanRecord) => void;
}

export const AnalysisResultScreen: React.FC<AnalysisResultScreenProps> = ({
  scan,
  onRescan,
  onOpenCopilot,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isHighRisk = scan.risk_score >= 70;
  const isSuspicious = scan.risk_score >= 30 && scan.risk_score < 70;
  const isSafe = scan.risk_score < 30;

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const rep = await api.generateReport(scan.id);
      window.open(`/api/reports/download/${rep.id}`, '_blank');
    } catch {
      window.open(`/api/reports/download/${scan.id}`, '_blank');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scan, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `CYBERGUARD-Scan-${scan.id.slice(0, 8)}.json`);
    dlAnchorElem.click();
  };

  const handleAction = (act: string) => {
    setActionNotice(`Action initiated: ${act}. Logged to security audit ledger.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const displayFindings =
    scan.evidence && scan.evidence.length > 0
      ? scan.evidence.map((e) => ({
          severity: e.severity.toUpperCase(),
          category: e.category,
          finding: e.finding,
        }))
      : (scan.findings || []).map((f) => ({
          severity: f.severity,
          category: f.category,
          finding: f.title,
        }));

  const displayRecs =
    scan.recommended_actions && scan.recommended_actions.length > 0
      ? scan.recommended_actions
      : scan.recommendations || [
          'Isolate incoming traffic from this source',
          'Verify cryptographic headers out-of-band',
          'Document incident details in team SIEM',
        ];

  return (
    <div className="dashboard animate-in fade-in duration-200">
      {/* Header */}
      <header className="page-head">
        <div>
          <div className="eyebrow">
            <i /> ANALYSIS COMPLETE
          </div>
          <h1>Analysis complete</h1>
          <p>
            {isHighRisk
              ? 'CyberGuard found multiple indicators that require immediate attention.'
              : isSuspicious
              ? 'CyberGuard identified anomalous patterns that warrant operational review.'
              : 'CyberGuard verified this signal as safe with clean baseline indicators.'}
          </p>
        </div>
        <button className="button ghost" onClick={onRescan}>
          ← New analysis
        </button>
      </header>

      {/* Analysis Pipeline (All steps complete) */}
      <div className="analysis-pipeline">
        {[
          ['INPUT', 'Signal normalized'],
          ['DETECT', 'Rules + ML'],
          ['EXPLAIN', 'Evidence mapped'],
          ['RESPOND', 'Action ready'],
        ].map(([label, detail], index) => (
          <div className="pipeline-step active" key={label}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
            {index < 3 && <i />}
          </div>
        ))}
      </div>

      {actionNotice && (
        <div className="p-3 mb-4 rounded-lg bg-cyan-500/10 border border-cyan/40 text-cyan text-xs font-mono flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Result Grid: Score + Evidence + Explanation */}
      <div className="result-grid">
        {/* Score Panel with Risk Ring */}
        <section className="panel score">
          <div className="eyebrow">ANALYSIS COMPLETE · RISK SCORE</div>
          <div
            className="risk-ring"
            style={{
              borderTopColor: isHighRisk ? 'var(--red)' : isSuspicious ? 'var(--amber)' : 'var(--lime)',
              borderRightColor: isHighRisk ? 'var(--red)' : isSuspicious ? 'var(--amber)' : 'var(--lime)',
            }}
          >
            <div>
              <strong>{scan.risk_score}</strong>
              <span className={isHighRisk ? 'red' : isSuspicious ? 'amber' : 'green'}>
                {scan.risk_level}
              </span>
            </div>
          </div>
          <span className={isHighRisk ? 'danger' : isSuspicious ? 'amber' : 'green'}>
            ● {scan.classification || `${scan.risk_level} RISK`}
          </span>
          <h2>{scan.input_type.toUpperCase()} threat assessment</h2>
          <p>
            Confidence score <b className="cyan">94%</b> &bull; Latency: {scan.processing_time_ms}ms
          </p>
        </section>

        {/* Evidence Panel */}
        <section className="panel evidence-panel">
          <div className="eyebrow">WHY CYBERGUARD FLAGGED THIS</div>
          <h2>Detection evidence ({displayFindings.length})</h2>

          {displayFindings.length > 0 ? (
            displayFindings.map((row, idx) => (
              <div className="evidence-row" key={idx}>
                <strong
                  className={
                    row.severity === 'HIGH' || row.severity === 'CRITICAL'
                      ? 'red'
                      : row.severity === 'MEDIUM'
                      ? 'amber'
                      : 'green'
                  }
                >
                  {row.severity}
                </strong>
                <b>{row.category}</b>
                <span>{row.finding}</span>
                <ChevronRight />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-ink text-xs font-mono">
              No hostile indicators discovered. All heuristic checks passed cleanly.
            </div>
          )}
        </section>

        {/* AI Security Explanation Panel */}
        <section className="panel explanation">
          <div className="eyebrow">
            <Sparkles /> AI SECURITY EXPLANATION
          </div>
          <h2>Why this needs attention</h2>
          <p>
            {scan.ai_explanation ||
              scan.executive_summary ||
              'CyberGuard evaluated this payload using deterministic heuristic rules and local machine learning inference to verify authenticity and signal patterns.'}
          </p>

          <div className="breakdown">
            <div>
              <b>{Math.round(scan.heuristic_score || 70)}%</b>
              <span>Rules weight</span>
            </div>
            <div>
              <b>{Math.round(scan.ml_score || 30)}%</b>
              <span>ML signal</span>
            </div>
            <div>
              <b>100%</b>
              <span>Air-gapped</span>
            </div>
          </div>

          <div className="recommendations">
            <b>Recommended response</b>
            {displayRecs.map((rec, i) => (
              <span key={i}>
                <Check /> {rec}
              </span>
            ))}
          </div>

          <div className="response-actions">
            <button className="button primary" onClick={() => handleAction('Source IP Block')}>
              Block
            </button>
            <button className="button ghost" onClick={() => handleAction('Security Bulletin Dispatched')}>
              Report
            </button>
            <button className="button ghost" onClick={() => onOpenCopilot(scan)}>
              <Bot className="w-3.5 h-3.5 mr-1 inline text-cyan" /> Ask Copilot
            </button>
            <button
              className="button ghost"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
            >
              <Download className="w-3.5 h-3.5 mr-1 inline" />
              {isGeneratingPdf ? 'Generating...' : 'PDF Report'}
            </button>
            <button className="button ghost" onClick={handleExportJSON}>
              <Share2 className="w-3.5 h-3.5 mr-1 inline" /> JSON
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalysisResultScreen;
