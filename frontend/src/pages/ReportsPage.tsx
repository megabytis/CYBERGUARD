import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Share2,
  Shield,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  X,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassModal } from '@/components/ui/GlassModal';
import { api, ScanSummaryItem, ScanRecord } from '@/lib/api';

export const ReportsPage: React.FC = () => {
  const [scans, setScans] = useState<ScanSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewScan, setPreviewScan] = useState<ScanRecord | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getScans({ limit: 40 });
        setScans(res.items);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleDownloadPDF = async (scanId: string) => {
    try {
      const rep = await api.generateReport(scanId);
      window.open(`/api/reports/download/${rep.id}`, '_blank');
    } catch {
      window.open(`/api/reports/download/${scanId}`, '_blank');
    }
  };

  const handleExportJSON = (scan: ScanSummaryItem) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scan, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `CYBERGUARD-Report-${scan.id.slice(0, 8)}.json`);
    dlAnchorElem.click();
  };

  const handleViewPreview = async (scanId: string) => {
    setIsPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const fullScan = await api.getScan(scanId);
      setPreviewScan(fullScan);
    } catch (err) {
      console.error('Failed to load scan preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const highRiskReports = scans.filter((s) => s.risk_score > 70).length;
  const safeReports = scans.filter((s) => s.risk_score <= 30).length;

  return (
    <div className="dashboard animate-in fade-in duration-200">
      <header className="page-head">
        <div>
          <div className="eyebrow">SECURITY OPERATIONS</div>
          <h1>Security Reports</h1>
          <p>
            Review generated forensic findings and export-ready security summaries.
          </p>
        </div>
        <button className="button primary" onClick={() => window.print()}>
          <FileText className="w-4 h-4 mr-1.5" /> Export report
        </button>
      </header>

      {/* V0 KPIs */}
      <div className="kpis" style={{ margin: '24px 0' }}>
        <div className="kpi">
          <span>Reports ready</span>
          <strong className="cyan">{scans.length}</strong>
          <small>Deliverables indexed</small>
        </div>
        <div className="kpi">
          <span>High confidence</span>
          <strong className="red">94%</strong>
          <small>Detection precision</small>
        </div>
        <div className="kpi">
          <span>Critical findings</span>
          <strong className="amber">{highRiskReports}</strong>
          <small>Elevated risk level</small>
        </div>
        <div className="kpi">
          <span>Clean baselines</span>
          <strong className="green">{safeReports}</strong>
          <small>Verified safe signals</small>
        </div>
      </div>

      <section className="panel table-panel">
        <div className="panel-head" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div className="eyebrow">RECENT REPORTS</div>
            <h2>Security deliverables</h2>
          </div>
          <span className="text-xs font-mono text-[var(--lime)] bg-[rgba(0,255,157,0.08)] px-2.5 py-1 rounded border border-[rgba(0,255,157,0.25)] font-bold">
            REPORTLAB &bull; RFC COMPLIANT
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[var(--cyan)] font-mono text-base">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-[var(--cyan)] border-t-transparent rounded-full mr-2" />
            Loading assessment library...
          </div>
        ) : scans.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left font-mono text-sm">
              <thead>
                <tr className="border-b border-[rgba(148,185,202,0.16)] text-[#718590] text-xs uppercase">
                  <th className="py-3 px-3">Report ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,185,202,0.1)]">
                {scans.map((s) => {
                  const isHigh = s.risk_score > 70;
                  const isMed = s.risk_score > 30 && s.risk_score <= 70;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[rgba(0,217,255,0.04)] transition-colors group"
                    >
                      {/* Report ID */}
                      <td className="py-3 px-3 font-bold text-[var(--cyan)]">
                        CG-REP-{s.id.slice(0, 8).toUpperCase()}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 uppercase text-[#e8f3f6]">
                        {s.input_type}
                      </td>

                      {/* Risk */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            isHigh
                              ? 'bg-[rgba(255,102,116,0.15)] text-[var(--red)] border border-[rgba(255,102,116,0.3)]'
                              : isMed
                              ? 'bg-[rgba(248,188,91,0.15)] text-[var(--amber)] border border-[rgba(248,188,91,0.3)]'
                              : 'bg-[rgba(0,255,157,0.15)] text-[var(--lime)] border border-[rgba(0,255,157,0.3)]'
                          }`}
                        >
                          {s.risk_score} &bull; {s.risk_level}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3 px-3 text-[#91a7af] text-xs whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Format */}
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-[rgba(7,20,27,0.6)] border border-[rgba(148,185,202,0.16)] text-[#718590]">
                          PDF &bull; JSON
                        </span>
                      </td>

                      {/* Actions: View | PDF | JSON */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="button ghost"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            onClick={() => handleViewPreview(s.id)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </button>

                          <button
                            className="button primary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            onClick={() => handleDownloadPDF(s.id)}
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> PDF
                          </button>

                          <button
                            className="button ghost"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            onClick={() => handleExportJSON(s)}
                            title="Download JSON"
                          >
                            <Share2 className="w-3.5 h-3.5 mr-1" /> JSON
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#718590] space-y-2">
            <FileText className="w-10 h-10 mx-auto text-[#718590]/60" />
            <p className="text-base font-bold text-[#c9d8dc]">No Reports Generated Yet</p>
            <p className="text-sm">Conduct threat analyses in the workspace to generate incident assessment reports.</p>
          </div>
        )}
      </section>

      {/* ========================================================
          PROFESSIONAL CYBERSECURITY ASSESSMENT PREVIEW MODAL
          ======================================================== */}
      <GlassModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="CYBERSECURITY ASSESSMENT REPORT PREVIEW"
        description={previewScan ? `Report Document: CG-REP-${previewScan.id.slice(0, 8).toUpperCase()}` : 'Loading...'}
        maxWidth="2xl"
      >
        {previewLoading ? (
          <div className="p-12 text-center text-information font-mono">
            <span className="animate-spin inline-block w-6 h-6 border-2 border-information border-t-transparent rounded-full mr-2" />
            Rendering formal assessment deliverable...
          </div>
        ) : previewScan ? (
          <div className="space-y-6 text-text-primary font-sans max-h-[70vh] overflow-y-auto pr-2">
            {/* Report Header Document Banner */}
            <div className="p-6 rounded-2xl bg-surface-elevated border border-border-bright space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-information" />
                  <span className="text-lg font-black font-display tracking-wider">
                    CYBERGUARD ASSESSMENT REPORT
                  </span>
                </div>
                <span className="text-xs font-mono text-protected bg-protected/10 px-2.5 py-0.5 rounded border border-protected/30">
                  CONFIDENTIAL &bull; DEFENSE ASSESSMENT
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-text-muted block">REPORT ID</span>
                  <span className="font-bold text-text-primary">CG-REP-{previewScan.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-text-muted block">INGESTION VECTOR</span>
                  <span className="font-bold text-text-primary uppercase">{previewScan.input_type}</span>
                </div>
                <div>
                  <span className="text-text-muted block">TIMESTAMP</span>
                  <span className="font-bold text-text-primary">{new Date(previewScan.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-text-muted block">CALCULATED RISK</span>
                  <span className={`font-black ${previewScan.risk_score > 70 ? 'text-critical' : previewScan.risk_score > 30 ? 'text-suspicious' : 'text-protected'}`}>
                    {previewScan.risk_score}/100 ({previewScan.risk_level})
                  </span>
                </div>
              </div>
            </div>

            {/* Target Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
                Inspected Target Artifact
              </h3>
              <div className="p-3.5 rounded-xl bg-surface-glass font-mono text-xs break-all border border-border">
                {previewScan.input_payload}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
                Executive Threat Summary
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary bg-surface-elevated/70 p-4 rounded-xl border border-border">
                {previewScan.executive_summary}
              </p>
            </div>

            {/* Itemized Evidence Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
                Itemized Evidence Ledger ({previewScan.findings?.length || 0})
              </h3>
              <div className="border border-border rounded-xl overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-surface-elevated border-b border-border text-text-muted">
                    <tr>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(previewScan.findings || []).map((f) => (
                      <tr key={f.id}>
                        <td className="p-3">
                          <span className={f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'text-critical font-bold' : f.severity === 'MEDIUM' ? 'text-suspicious font-bold' : 'text-protected font-bold'}>
                            {f.severity}
                          </span>
                        </td>
                        <td className="p-3 text-text-muted">{f.category}</td>
                        <td className="p-3 text-text-primary">{f.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Explanation */}
            {previewScan.ai_explanation && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-information font-bold">
                  AI Threat Analysis & Reasoning
                </h3>
                <div className="text-xs leading-relaxed text-text-secondary bg-surface-glass p-4 rounded-xl border border-information/30 whitespace-pre-wrap">
                  {previewScan.ai_explanation}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-protected font-bold">
                Actionable Countermeasures
              </h3>
              <div className="space-y-2">
                {(previewScan.recommendations || []).map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-glass border border-border text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-protected/15 text-protected flex items-center justify-center font-mono font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => handleDownloadPDF(previewScan.id)}
                icon={<Download className="w-4 h-4" />}
              >
                Download Official PDF Deliverable
              </GlassButton>
            </div>
          </div>
        ) : null}
      </GlassModal>
    </div>
  );
};
