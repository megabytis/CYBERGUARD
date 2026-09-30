import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Trash2,
  FileText,
  Download,
  Eye,
  Share2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  X,
  RotateCcw,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassDrawer } from '@/components/ui/GlassModal';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { EvidenceStrengthBar } from '@/components/ui/RollingKPI';
import { ForensicNarrative } from '@/components/scanner/ForensicNarrative';
import { api, ScanSummaryItem, ScanRecord } from '@/lib/api';

const RISK_FILTERS = [
  { id: '', label: 'All Risks' },
  { id: 'HIGH', label: 'High Risk' },
  { id: 'MEDIUM', label: 'Suspicious' },
  { id: 'LOW', label: 'Safe' },
];

const TYPE_FILTERS = [
  { id: '', label: 'All Types' },
  { id: 'email', label: 'Email' },
  { id: 'url', label: 'URL' },
  { id: 'message', label: 'Message' },
  { id: 'auth_log', label: 'Auth' },
  { id: 'network', label: 'Network' },
];

export const HistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanSummaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [inputType, setInputType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Investigation Drawer state
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchScans = async (customQuery?: string) => {
    setIsLoading(true);
    try {
      const q = customQuery !== undefined ? customQuery : search;
      const data = await api.getScans({
        page,
        limit: 15,
        query: q.trim() || undefined,
        input_type: inputType || undefined,
        risk_level: riskLevel || undefined,
      });
      setScans(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Live debounced search as user types + reactive filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchScans();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, inputType, riskLevel, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    fetchScans('');
  };

  const handleResetFilters = () => {
    setSearch('');
    setInputType('');
    setRiskLevel('');
    setPage(1);
  };

  const handleOpenDetails = async (id: string) => {
    setIsDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const fullScan = await api.getScan(id);
      setSelectedScan(fullScan);
    } catch (err) {
      console.error('Failed to get scan details:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Confirm permanent deletion of this threat analysis record?')) return;
    try {
      await api.deleteScan(id);
      if (selectedScan?.id === id) setIsDrawerOpen(false);
      fetchScans();
    } catch (err) {
      alert('Failed to delete scan record.');
    }
  };

  const handleDownloadPDF = async (scanId: string) => {
    try {
      const rep = await api.generateReport(scanId);
      window.open(api.getUrl(`/reports/download/${rep.id}`), '_blank');
    } catch {
      window.open(api.getUrl(`/reports/download/${scanId}`), '_blank');
    }
  };

  const highRiskCount = scans.filter((s) => s.risk_score > 70).length;
  const suspiciousCount = scans.filter((s) => s.risk_score > 30 && s.risk_score <= 70).length;
  const safeCount = scans.filter((s) => s.risk_score <= 30).length;

  return (
    <div className="dashboard animate-in fade-in duration-200">
      {/* Title Bar & SIEM Export Actions */}
      <header className="page-head">
        <div>
          <div className="eyebrow">SECURITY OPERATIONS</div>
          <h1>Activity & History</h1>
          <p>
            A complete timeline of analyzed signals, forensic evidence ledgers, and audit events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getUrl('/scans/export/csv')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <button className="button ghost">
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </button>
          </a>

          <a
            href={api.getUrl('/scans/export/json')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <button className="button primary">
              <Share2 className="w-4 h-4 mr-1.5" /> Export JSON
            </button>
          </a>
        </div>
      </header>

      {/* V0 KPIs */}
      <div className="kpis" style={{ margin: '24px 0' }}>
        <div className="kpi">
          <span>Events tracked</span>
          <strong className="cyan">{total.toLocaleString()}</strong>
          <small>Recorded in database</small>
        </div>
        <div className="kpi">
          <span>High risk</span>
          <strong className="red">{highRiskCount}</strong>
          <small>Critical threats</small>
        </div>
        <div className="kpi">
          <span>Suspicious</span>
          <strong className="amber">{suspiciousCount}</strong>
          <small>Requires review</small>
        </div>
        <div className="kpi">
          <span>Safe signals</span>
          <strong className="green">{safeCount}</strong>
          <small>Low risk / benign</small>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <section className="panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 flex items-center rounded-xl border border-cyan-500/30 dark:border-cyan-400/35 bg-white/95 dark:bg-[#07141B]/95 shadow-sm dark:shadow-[0_0_20px_rgba(0,217,255,0.08)] focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/25 transition-all">
            <div className="pl-4 pr-2 text-cyan-600 dark:text-cyan-400 shrink-0 flex items-center">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search target summaries, indicators, domains, IPs, hashes..."
              className="w-full h-12 bg-transparent text-slate-950 dark:text-white font-mono text-sm sm:text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-sans selection:bg-cyan-500/20"
              style={{ padding: '0 8px' }}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1.5 mr-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            className="h-12 px-6 rounded-xl font-mono text-xs uppercase tracking-wider font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 dark:text-[#08090C] shadow-[0_0_15px_rgba(0,217,255,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            type="submit"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </form>

        {/* Dedicated Filter Pills: Risk and Type */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 mt-3.5 border-t border-[rgba(148,185,202,0.16)] dark:border-white/10">
          {/* Risk Level Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase font-bold mr-1">
              Risk:
            </span>
            {RISK_FILTERS.map((rf) => {
              const isActive = riskLevel === rf.id;
              return (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => {
                    setRiskLevel(rf.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-cyan-500/20 dark:bg-cyan-500/25 border-cyan-500 dark:border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold shadow-sm dark:shadow-[0_0_12px_rgba(0,217,255,0.25)]'
                      : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40'
                  }`}
                >
                  {rf.label}
                </button>
              );
            })}
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase font-bold mr-1">
              Type:
            </span>
            {TYPE_FILTERS.map((tf) => {
              const isActive = inputType === tf.id;
              return (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => {
                    setInputType(tf.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-500/20 dark:bg-emerald-500/25 border-emerald-500 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/40'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {(Boolean(search) || Boolean(riskLevel) || Boolean(inputType)) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-[rgba(148,185,202,0.16)] dark:border-white/10 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                  <span>Query: "{search}"</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-red-500 cursor-pointer"
                    title="Remove query filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {riskLevel && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                  <span>Risk: {RISK_FILTERS.find((r) => r.id === riskLevel)?.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRiskLevel('');
                      setPage(1);
                    }}
                    className="hover:text-red-500 cursor-pointer"
                    title="Remove risk filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inputType && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  <span>Type: {TYPE_FILTERS.find((t) => t.id === inputType)?.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInputType('');
                      setPage(1);
                    }}
                    className="hover:text-red-500 cursor-pointer"
                    title="Remove type filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            <div className="text-slate-500 dark:text-slate-400">
              Found <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{total}</strong> records
            </div>
          </div>
        )}
      </section>

      {/* Results Table matching exact columns */}
      <section className="panel table-panel">
        <div className="panel-head" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div className="eyebrow">RECENT ACTIVITY</div>
            <h2>Analysis timeline</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#70828b]">
              Page {page} of {pages} ({total} events)
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-information font-mono text-base">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-information border-t-transparent rounded-full mr-2" />
            Loading historical threat records...
          </div>
        ) : scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted text-xs uppercase">
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Risk</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4">Finding</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {scans.map((scan) => {
                  const isHigh = scan.risk_score > 70;
                  const isMed = scan.risk_score > 30 && scan.risk_score <= 70;
                  return (
                    <tr
                      key={scan.id}
                      onClick={() => handleOpenDetails(scan.id)}
                      className="hover:bg-surface-glass-hover transition-colors cursor-pointer group"
                    >
                      {/* Time */}
                      <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                        {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 uppercase text-text-primary font-bold">
                        {scan.input_type}
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-black text-base ${
                            isHigh ? 'text-critical' : isMed ? 'text-suspicious' : 'text-protected'
                          }`}
                        >
                          {scan.risk_score}
                        </span>
                        <span className="text-text-muted text-xs">/100</span>
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-4">
                        <GlassBadge
                          variant={isHigh ? 'critical' : isMed ? 'suspicious' : 'protected'}
                          size="sm"
                        >
                          {scan.risk_level}
                        </GlassBadge>
                      </td>

                      {/* Finding */}
                      <td className="py-3.5 px-4 text-text-primary font-sans max-w-xs truncate">
                        {scan.input_summary}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-surface-glass border border-border text-text-muted font-mono">
                          TRIAGED ({scan.findings_count} items)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetails(scan.id)}
                            className="p-1.5 rounded-lg bg-surface-glass hover:bg-information/20 text-information transition-colors"
                            title="Open Investigation Drawer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(scan.id)}
                            className="p-1.5 rounded-lg bg-surface-glass hover:bg-protected/20 text-protected transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(scan.id, e)}
                            className="p-1.5 rounded-lg bg-surface-glass hover:bg-critical/20 text-critical transition-colors"
                            title="Delete Scan"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="p-12 text-center text-text-muted space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-cyan-500/40" />
            <p className="text-base font-bold text-slate-900 dark:text-white">No Historical Scans Found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search || riskLevel || inputType
                ? `No records match query "${search || 'active filters'}".`
                : 'No analysis records recorded yet in the database.'}
            </p>
            {(Boolean(search) || Boolean(riskLevel) || Boolean(inputType)) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters & Show All</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <GlassButton
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </GlassButton>
            <span className="text-xs font-mono text-text-muted">
              Page {page} of {pages}
            </span>
            <GlassButton
              variant="ghost"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
            </GlassButton>
          </div>
        )}
      </section>

      {/* ========================================================
          SLIDE-OUT INVESTIGATION DRAWER (DO NOT LEAVE PAGE)
          ======================================================== */}
      <GlassDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Threat Investigation Dossier"
        subtitle={selectedScan ? `Scan ID: ${selectedScan.id}` : 'Loading...'}
        width="lg"
      >
        {drawerLoading ? (
          <div className="p-12 text-center text-information font-mono">
            <span className="animate-spin inline-block w-6 h-6 border-2 border-information border-t-transparent rounded-full mr-2" />
            Loading forensic investigation details...
          </div>
        ) : selectedScan ? (
          <div className="space-y-6">
            {/* Header Verdict Card */}
            <div className="p-5 rounded-2xl bg-surface-glass border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-text-muted">
                  Vector: {selectedScan.input_type}
                </span>
                <GlassBadge
                  variant={
                    selectedScan.risk_score > 70
                      ? 'critical'
                      : selectedScan.risk_score > 30
                      ? 'suspicious'
                      : 'protected'
                  }
                  size="md"
                >
                  {selectedScan.risk_score}/100 &bull; {selectedScan.risk_level}
                </GlassBadge>
              </div>

              <h3 className="text-base font-bold text-text-primary font-sans break-all">
                {selectedScan.input_summary}
              </h3>

              <div className="text-xs font-mono text-text-muted flex items-center justify-between pt-2 border-t border-border/60">
                <span>{new Date(selectedScan.created_at).toLocaleString()}</span>
                <span>Latency: {selectedScan.processing_time_ms}ms</span>
              </div>
            </div>

            {/* Why Flagged Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-text-muted">
                Executive Threat Summary
              </h4>
              <p className="text-sm font-sans text-text-secondary leading-relaxed bg-surface-elevated p-4 rounded-xl border border-border">
                {selectedScan.executive_summary}
              </p>
            </div>

            {/* Evidence Findings */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-text-muted">
                Extracted Evidence ({selectedScan.findings?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {(selectedScan.findings || []).map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl bg-surface-glass border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-text-muted uppercase font-bold">{f.category}</span>
                      <span
                        className={
                          f.severity === 'CRITICAL' || f.severity === 'HIGH'
                            ? 'text-critical font-bold'
                            : f.severity === 'MEDIUM'
                            ? 'text-suspicious font-bold'
                            : 'text-protected font-bold'
                        }
                      >
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-text-primary">{f.title}</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <ForensicNarrative
              narrative={selectedScan.ai_explanation}
              score={selectedScan.risk_score}
              verdict={selectedScan.risk_score >= 70 ? 'critical' : selectedScan.risk_score >= 30 ? 'review' : 'safe'}
              evidence={selectedScan.findings}
              target={selectedScan.input_summary || selectedScan.input_payload}
            />

            {/* Recommended Responses */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-protected">
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {(selectedScan.recommendations || []).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-glass border border-border text-xs text-text-primary flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-protected/15 text-protected flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => handleDownloadPDF(selectedScan.id)}
                icon={<Download className="w-4 h-4" />}
              >
                Download PDF
              </GlassButton>

              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/app/scanner?view=${selectedScan.id}`, '_blank')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Open in Workspace
              </GlassButton>
            </div>
          </div>
        ) : null}
      </GlassDrawer>
    </div>
  );
};
