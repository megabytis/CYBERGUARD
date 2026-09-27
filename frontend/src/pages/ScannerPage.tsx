import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Mail,
  Globe2,
  MessageSquare,
  QrCode,
  Terminal,
  Network,
  FileCode,
  LockKeyhole,
  ArrowRight,
  Sparkles,
  Upload,
} from 'lucide-react';
import { AnalysisResultScreen } from '@/components/scanner/AnalysisResultScreen';
import { api, ScanRecord } from '@/lib/api';

const types = [
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'Paste suspicious email content…' },
  { id: 'url', label: 'URL', icon: Globe2, placeholder: 'https://example.com/login?token=…' },
  { id: 'message', label: 'Message', icon: MessageSquare, placeholder: 'Paste suspicious SMS / chat text…' },
  { id: 'qr', label: 'QR code', icon: QrCode, placeholder: 'Upload QR image or paste decoded payload…' },
  { id: 'auth_log', label: 'Auth logs', icon: Terminal, placeholder: 'Paste authentication logs / syslog…' },
  { id: 'headers', label: 'Raw Email Headers', icon: FileCode, placeholder: 'Paste RFC 5322 raw email headers…' },
  { id: 'network', label: 'Network', icon: Network, placeholder: 'Paste NetFlow or packet records…' },
];

const PRESETS: Record<string, string> = {
  email: `From: CEO Executive Office <tim.cook@apple-operations-internal.cc>
Reply-To: wire-processing@secure-banking-portal.net
Subject: URGENT: Immediate Wire Transfer Required for Acquisition Closing

Please execute the attached international wire transfer of $840,000 before 4 PM UTC.
Do not discuss with other staff until public disclosure. Immediate verification needed.`,
  url: 'https://apple-id-verify.security-update.cc/login?redirect=account-lockout',
  message: 'USPS Notice: Your package delivery is blocked due to an unpaid $1.99 customs fee. Confirm your address and card at bit.ly/usps-redelivery-tax to avoid return.',
  qr: 'https://paypal-security-verification.com.ru/auth/login?session=expiring',
  auth_log: `Sep 27 11:04:12 auth-server sshd[1401]: Failed password for invalid user admin from 198.51.100.44 port 41232 ssh2
Sep 27 11:04:14 auth-server sshd[1402]: Failed password for invalid user root from 198.51.100.44 port 41234 ssh2
Sep 27 11:04:16 auth-server sshd[1403]: Failed password for invalid user oracle from 198.51.100.44 port 41236 ssh2
Sep 27 11:04:18 auth-server sshd[1404]: Failed password for invalid user deploy from 198.51.100.44 port 41238 ssh2`,
  headers: `From: PayPal Security <service@paypal.com>
Reply-To: phish-collector@scam-server.cc
Return-Path: bounce@attacker-domain.ru
Authentication-Results: mx.google.com; spf=fail; dkim=fail; dmarc=fail`,
  network: `2026-09-27T11:00:01Z 10.0.4.15:49182 -> 203.0.113.88:4444 PROTO=TCP BYTES_OUT=1420 BYTES_IN=310
2026-09-27T11:00:31Z 10.0.4.15:49184 -> 203.0.113.88:4444 PROTO=TCP BYTES_OUT=1420 BYTES_IN=310`,
};

export const ScannerPage: React.FC<{ onOpenCopilot?: () => void }> = ({
  onOpenCopilot: propOnOpenCopilot,
}) => {
  const outletCtx = useOutletContext<{ onOpenCopilot?: () => void }>() || {};
  const onOpenCopilot = propOnOpenCopilot || outletCtx.onOpenCopilot || (() => {});
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'email');
  const [input, setInput] = useState(PRESETS[activeTab] || '');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [currentResult, setCurrentResult] = useState<ScanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if viewing a specific scan from history or dashboard
  useEffect(() => {
    const viewId = searchParams.get('view') || searchParams.get('id');
    if (viewId) {
      api.getScan(viewId)
        .then((res) => {
          setCurrentResult(res);
          setActiveTab(res.input_type);
        })
        .catch(console.error);
    }
  }, [searchParams]);

  const handleTabChange = (typeId: string) => {
    setActiveTab(typeId);
    setSearchParams({ type: typeId });
    setInput(PRESETS[typeId] || '');
    setQrFile(null);
    setError(null);
    setCurrentResult(null);
  };

  const handleUseExample = () => {
    if (PRESETS[activeTab]) {
      setInput(PRESETS[activeTab]);
      setError(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setQrFile(null);
    setError(null);
  };

  const runAnalysis = async () => {
    if (activeTab === 'qr' && !qrFile && !input.trim()) {
      setError('Please upload a QR code image or paste an extracted payload string.');
      return;
    }
    if (activeTab !== 'qr' && !input.trim()) {
      setError('Please provide input content to analyse.');
      return;
    }

    setError(null);
    setLoading(true);
    setActivePipelineStep(0);

    const stepInterval = setInterval(() => {
      setActivePipelineStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 280);

    try {
      let result: ScanRecord;
      if (activeTab === 'qr' && qrFile) {
        result = await api.analyzeQR(qrFile, true);
      } else {
        result = await api.analyze(activeTab, input, true);
      }
      clearInterval(stepInterval);
      setCurrentResult(result);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Analysis failed. Check your input format.');
    } finally {
      setLoading(false);
    }
  };

  if (currentResult) {
    return (
      <AnalysisResultScreen
        scan={currentResult}
        onRescan={() => {
          setCurrentResult(null);
          setSearchParams({ type: activeTab });
        }}
        onOpenCopilot={onOpenCopilot}
      />
    );
  }

  const currentTypeConfig = types.find((t) => t.id === activeTab) || types[0];

  return (
    <div className="dashboard animate-in fade-in duration-200">
      {/* Header */}
      <header className="page-head">
        <div>
          <div className="eyebrow">DEFENSIVE ANALYSIS WORKSPACE</div>
          <h1>Analyze a threat</h1>
          <p>Submit a suspicious signal and get an explainable risk assessment.</p>
        </div>
        <span className="flex items-center gap-1.5 text-lime text-xs font-mono border border-lime/30 px-3 py-1 rounded-full bg-lime/5">
          <LockKeyhole className="w-3.5 h-3.5" /> PRIVATE & SECURE
        </span>
      </header>

      {/* Type Tabs from v0 */}
      <div className="type-tabs">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={activeTab === t.id ? 'active' : ''}
              onClick={() => handleTabChange(t.id)}
            >
              <Icon />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red/10 border border-red/30 text-red text-xs font-mono">
          {error}
        </div>
      )}

      {/* Input Panel from v0 */}
      <section className="panel input-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">{currentTypeConfig.label.toUpperCase()} INPUT</div>
            <h2>What would you like to inspect?</h2>
          </div>
          <button className="select cursor-pointer hover:border-cyan" onClick={handleUseExample}>
            Use example input
          </button>
        </div>

        {activeTab === 'qr' ? (
          <div className="space-y-4 my-4">
            <div className="border-2 border-dashed border-line rounded-lg p-6 text-center bg-black/30">
              <input
                type="file"
                id="qr-file-input"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setQrFile(e.target.files[0]);
                }}
              />
              <label
                htmlFor="qr-file-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="p-3 rounded-full bg-white/5 text-cyan border border-cyan/30">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-text-primary">
                  {qrFile ? qrFile.name : 'Upload QR code image (PNG, JPEG, WebP)'}
                </p>
                <p className="text-xs text-muted-ink">
                  In-memory decoding without browser auto-redirects.
                </p>
              </label>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Or paste extracted URL / destination string..."
              rows={3}
            />
          </div>
        ) : (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentTypeConfig.placeholder}
            rows={activeTab === 'url' ? 3 : 7}
          />
        )}

        <div className="input-footer">
          <small>
            {input.length} characters &bull; Zero-SSRF Offline Analysis
          </small>
          <div className="flex items-center gap-3">
            <button className="button ghost" onClick={handleClear}>
              Clear
            </button>
            <button
              className="button primary"
              disabled={(!input && !qrFile) || loading}
              onClick={runAnalysis}
            >
              {loading ? (
                'Analyzing signal…'
              ) : (
                <>
                  Analyze with CyberGuard <ArrowRight />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Analysis Pipeline & Processing Overlay from v0 */}
      {loading && (
        <div className="mt-6 space-y-4 animate-in fade-in">
          <div className="analysis-pipeline">
            {[
              ['INPUT', 'Signal normalized'],
              ['DETECT', 'Rules + ML'],
              ['EXPLAIN', 'Evidence mapped'],
              ['RESPOND', 'Action ready'],
            ].map(([label, detail], index) => (
              <div
                className={`pipeline-step ${index <= activePipelineStep ? 'active' : ''}`}
                key={label}
              >
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
                {index < 3 && <i />}
              </div>
            ))}
          </div>

          <div className="panel flex items-center gap-5 p-6 border-cyan/30">
            <Sparkles className="w-8 h-8 text-cyan animate-pulse shrink-0" />
            <div>
              <div className="eyebrow">ANALYSIS IN PROGRESS</div>
              <h2 className="text-xl font-bold font-display my-1">
                Building your security assessment
              </h2>
              <p className="text-xs text-muted-ink m-0">
                Normalizing input tokens, evaluating deterministic heuristics, and preparing an explainable result.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
