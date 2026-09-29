import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  ShieldAlert,
  Network,
  Mail,
  Globe,
  Lock,
  Cpu,
  Binary,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { SpotlightCard } from '@/components/magicui/SpotlightCard';
import { api, DashboardStats, ScanSummaryItem } from '@/lib/api';

export const IntelligencePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<Array<{ time: string; avgScore: number; incidents: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => null),
      api.getScans({ limit: 40 }).catch(() => null),
    ])
      .then(([statsData, scansData]) => {
        if (statsData) setStats(statsData);

        // Group scans into dynamic time buckets
        const rawScans: ScanSummaryItem[] = scansData?.items || statsData?.recent_scans || [];
        if (rawScans.length > 0) {
          const buckets: Record<string, { total: number; count: number }> = {
            '00:00': { total: 0, count: 0 },
            '04:00': { total: 0, count: 0 },
            '08:00': { total: 0, count: 0 },
            '12:00': { total: 0, count: 0 },
            '16:00': { total: 0, count: 0 },
            '20:00': { total: 0, count: 0 },
            '23:59': { total: 0, count: 0 },
          };

          rawScans.forEach((s: ScanSummaryItem) => {
            const d = new Date(s.created_at);
            const hour = d.getHours();
            let bucketKey = '23:59';
            if (hour < 4) bucketKey = '00:00';
            else if (hour < 8) bucketKey = '04:00';
            else if (hour < 12) bucketKey = '08:00';
            else if (hour < 16) bucketKey = '12:00';
            else if (hour < 20) bucketKey = '16:00';
            else if (hour < 24) bucketKey = '20:00';

            buckets[bucketKey].total += s.risk_score;
            buckets[bucketKey].count += 1;
          });

          const dynamicTrends = Object.entries(buckets).map(([time, data]) => ({
            time,
            avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
            incidents: data.count,
          }));
          setTrendData(dynamicTrends);
        } else {
          setTrendData([
            { time: '00:00', avgScore: 0, incidents: 0 },
            { time: '04:00', avgScore: 0, incidents: 0 },
            { time: '08:00', avgScore: 0, incidents: 0 },
            { time: '12:00', avgScore: 0, incidents: 0 },
            { time: '16:00', avgScore: 0, incidents: 0 },
            { time: '20:00', avgScore: 0, incidents: 0 },
            { time: '23:59', avgScore: 0, incidents: 0 },
          ]);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const vectorData = stats?.scanner_distribution || [];

  return (
    <div className="dashboard animate-in fade-in duration-200">
      {/* Header */}
      <header className="page-head">
        <div>
          <div className="eyebrow">SECURITY OPERATIONS</div>
          <h1>Threat Intelligence</h1>
          <p>
            Live signals, patterns, and telemetry across your defensive protection perimeter.
          </p>
        </div>
        <button className="button primary" onClick={() => window.print()}>
          Export report
        </button>
      </header>

      {/* Dynamic Telemetry KPIs */}
      <div className="kpis" style={{ margin: '24px 0' }}>
        <div className="kpi">
          <span>Total Ingested</span>
          <strong className="cyan">{stats?.total_scans ?? 0}</strong>
          <small>Verified defensive signals</small>
        </div>
        <div className="kpi">
          <span>Critical Alerts</span>
          <strong className="red">{stats?.high_risk_count ?? 0}</strong>
          <small>Immediate containment required</small>
        </div>
        <div className="kpi">
          <span>Mean Threat Score</span>
          <strong className="green">{Math.round(stats?.average_risk_score ?? 0)}/100</strong>
          <small>Composite risk baseline</small>
        </div>
        <div className="kpi">
          <span>Monitored Vectors</span>
          <strong className="cyan">{vectorData.length} of 7 Active</strong>
          <small>Threat coverage breadth</small>
        </div>
      </div>

      {/* Large Charts: Risk Trends & Detection Distribution */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        {/* Large Chart 1: Risk Trends */}
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">24-HOUR DEFENSIVE CYCLE</div>
              <h2>Risk trends</h2>
            </div>
            <TrendingUp className="w-4 h-4 text-[var(--cyan)]" />
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#718590"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                />
                <YAxis
                  stroke="#718590"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07141b',
                    borderColor: 'rgba(0,217,255,0.3)',
                    borderRadius: '6px',
                    color: '#e8f3f6',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#00D9FF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGrad)"
                  name="Mean Threat Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 text-xs font-mono text-[#718590] text-center">
            Elevated threat activity concentrates between 11:00 UTC and 16:00 UTC.
          </div>
        </section>

        {/* Large Chart 2: Detection Distribution */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">VECTOR INGESTION</div>
              <h2>Detection distribution</h2>
            </div>
            <Cpu className="w-4 h-4 text-[var(--lime)]" />
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={vectorData}
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <XAxis type="number" stroke="#718590" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis
                  dataKey="type"
                  type="category"
                  stroke="#718590"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  tickFormatter={(val) => val.toUpperCase()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07141b',
                    borderColor: 'rgba(0,217,255,0.3)',
                    borderRadius: '6px',
                    color: '#e8f3f6',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#00FF9D" radius={[0, 4, 4, 0]} name="Analyses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 text-xs font-mono text-[#718590] text-center">
            URL and Email inspection represent highest volume vectors.
          </div>
        </section>
      </div>

      {/* V0 Threat Patterns Table */}
      <section className="panel table-panel" style={{ marginBottom: '28px' }}>
        <div className="panel-head">
          <div>
            <div className="eyebrow">THREAT INTELLIGENCE</div>
            <h2>Active threat patterns</h2>
          </div>
          <span className="text-xs font-mono text-[var(--cyan)]">● 6 ACTIVE SIGNATURES</span>
        </div>
        <div className="activity-list">
          {[
            ['Now', 'Emerging phishing kits', 'HIGH', 'Observed across 8 live domains'],
            ['Today', 'Executive impersonation', 'MEDIUM', 'New language urgency pattern'],
            ['Today', 'Suspicious OAuth flows', 'HIGH', '3 connected anomalous accounts'],
            ['Yesterday', 'Credential harvesting', 'MEDIUM', 'Urgency password reset appeals'],
            ['Yesterday', 'C2 reverse beaconing', 'HIGH', 'Metasploit default port 4444'],
            ['2 days ago', 'Punycode homoglyph flood', 'MEDIUM', 'Cyrillic root domain spoofing']
          ].map(([time, title, risk, detail]) => (
            <div className="activity-row" key={time + title}>
              <Cpu className="activity-icon" />
              <span className="activity-time">{time}</span>
              <b>{title}</b>
              <span>{detail}</span>
              <strong className={risk === 'HIGH' ? 'red' : 'amber'}>{risk}</strong>
              <span className="text-[#8ea5ae] text-xs">→</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pattern Forensics Cards */}
      <div className="space-y-6">
        <div>
          <div className="eyebrow">FORENSIC TAXONOMY</div>
          <h2 style={{ fontSize: '24px', margin: '8px 0 16px' }}>Core Threat Pattern Forensics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 3: Authentication Anomalies */}
          <section className="panel settings-card" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-critical/15 text-critical border border-critical/30">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-text-primary">
                    Authentication Anomalies
                  </h3>
                  <span className="text-xs font-mono text-text-muted">BRUTE FORCE & SPRAYING</span>
                </div>
              </div>
              <GlassBadge variant="critical" size="sm">
                HIGH SEVERITY
              </GlassBadge>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              CYBERGUARD parses syslog and authentication traces for high-frequency credential bursts.
              Signatures flag $\ge 5$ password rejections within short sliding windows, targeting invalid
              system accounts (root, admin, deploy).
            </p>

            <div className="pt-3 border-t border-border/60 space-y-2 text-xs font-mono text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-critical" />
                <span>Detection: Rapid consecutive SSH authentication failures</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-critical" />
                <span>Defense: Immediate source IP firewall drop & account rate-limiting</span>
              </div>
            </div>
          </section>

          {/* Section 4: Network Anomalies */}
          <section className="panel settings-card" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-protected/15 text-protected border border-protected/30">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-text-primary">
                    Network Anomalies & C2
                  </h3>
                  <span className="text-xs font-mono text-text-muted">COMMAND & CONTROL</span>
                </div>
              </div>
              <GlassBadge variant="protected" size="sm">
                BEHAVIORAL
              </GlassBadge>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              Detects reverse shell connections and botnet heartbeats by evaluating packet interval periodicity
              (e.g., 30s beaconing jitter), connections directed to Metasploit default ports (4444, 1337), and asymmetric byte exfiltration ratios.
            </p>

            <div className="pt-3 border-t border-border/60 space-y-2 text-xs font-mono text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-protected" />
                <span>Detection: Periodic packet intervals & suspicious egress ports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-protected" />
                <span>Defense: Terminate process socket & sinkhole destination IP</span>
              </div>
            </div>
          </section>

          {/* Section 5: Phishing Patterns */}
          <section className="panel settings-card" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-suspicious/15 text-suspicious border border-suspicious/30">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-text-primary">
                    Phishing & Extortion Patterns
                  </h3>
                  <span className="text-xs font-mono text-text-muted">SOCIAL ENGINEERING</span>
                </div>
              </div>
              <GlassBadge variant="suspicious" size="sm">
                CONTENT & STRUCTURE
              </GlassBadge>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              Analyzes psychological coercion syntax including urgent account suspension threats,
              unauthorized financial wire transfer demands, and OTP / MFA credential intercept appeals
              commonly deployed in Smishing and BEC attacks.
            </p>

            <div className="pt-3 border-t border-border/60 space-y-2 text-xs font-mono text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-suspicious" />
                <span>Detection: High-pressure urgency tokens & wire transfer phrasing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-suspicious" />
                <span>Defense: Quarantine message at mail gateway & notify SOC</span>
              </div>
            </div>
          </section>

          {/* Section 6: Impersonation Patterns */}
          <section className="panel settings-card" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-information/15 text-information border border-information/30">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-text-primary">
                    Impersonation & Lookalikes
                  </h3>
                  <span className="text-xs font-mono text-text-muted">PUNYCODE & TYPOSQUATTING</span>
                </div>
              </div>
              <GlassBadge variant="information" size="sm">
                LEXICAL & DNS
              </GlassBadge>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              Discovers brand token mismatches (Apple, Microsoft, PayPal) hosted on unauthenticated root domains,
              Internationalized Domain Name (IDN) Cyrillic homoglyphs, and envelope From vs. Reply-To divergences.
            </p>

            <div className="pt-3 border-t border-border/60 space-y-2 text-xs font-mono text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-information" />
                <span>Detection: Punycode (`xn--`) & brand typosquatting distance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-information" />
                <span>Defense: Issue registrar takedown notice & DNS resolver block</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
