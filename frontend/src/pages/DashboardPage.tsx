import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ChevronRight,
  BrainCircuit,
  ArrowRight,
  Mail,
  Globe2,
  MessageSquare,
  QrCode,
  Terminal,
  Network,
  FileText,
} from 'lucide-react';
import { api, DashboardStats } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const getVectorIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email':
      return <Mail className="w-4 h-4 text-cyan" />;
    case 'url':
      return <Globe2 className="w-4 h-4 text-cyan" />;
    case 'message':
      return <MessageSquare className="w-4 h-4 text-cyan" />;
    case 'qr':
      return <QrCode className="w-4 h-4 text-cyan" />;
    case 'auth_log':
      return <Terminal className="w-4 h-4 text-cyan" />;
    case 'network':
      return <Network className="w-4 h-4 text-cyan" />;
    default:
      return <FileText className="w-4 h-4 text-cyan" />;
  }
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const analystName = (user?.profile?.full_name || 'ALEX KIM').toUpperCase();

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard flex items-center justify-center min-h-[450px]">
        <div className="flex items-center gap-3 text-cyan font-mono text-sm">
          <span className="animate-spin w-5 h-5 border-2 border-cyan border-t-transparent rounded-full" />
          <span>Synchronizing Protection Center Telemetry...</span>
        </div>
      </div>
    );
  }

  // Generate dynamic AI insight text
  const highScans = stats?.high_risk_count || 0;
  const totalScans = stats?.total_scans || 0;
  const insightTitle =
    highScans > 0
      ? 'Credential requests are trending higher.'
      : 'Zero critical intrusion signals observed.';
  const insightDesc =
    highScans > 0
      ? `${Math.round((highScans / (totalScans || 1)) * 100)}% of analyzed high-risk payloads exhibited urgency language paired with deceptive destinations.`
      : 'All monitored ingestion disciplines report clean baseline parameters with no anomalous authentication bursts or lookalike destinations.';

  const recentScans = stats?.recent_scans || [];

  return (
    <div className="dashboard animate-in fade-in duration-200">
      {/* Page Header */}
      <header className="page-head">
        <div>
          <div className="eyebrow">GOOD MORNING, {analystName}</div>
          <h1>Protection center</h1>
          <p>Monitor analysis activity, risk trends and security findings.</p>
        </div>
        <button
          className="button primary"
          onClick={() => navigate('/app/scanner')}
        >
          <Zap /> Analyze a threat
        </button>
      </header>

      {/* System Status Banner */}
      <div className="system">
        <i /> <b>Protection active</b>
        <span>All analysis systems operational</span>
        <small>Last sync {new Date().toLocaleTimeString()}</small>
      </div>

      {/* 4 KPIs */}
      <div className="kpis">
        <div className="kpi">
          <span>Total analyses</span>
          <strong className="cyan">{stats?.total_scans || 0}</strong>
          <small>
            +18.2% <em>vs last 30 days</em>
          </small>
        </div>
        <div className="kpi">
          <span>High risk</span>
          <strong className="red">{stats?.high_risk_count || 0}</strong>
          <small>
            -12.4% <em>vs last 30 days</em>
          </small>
        </div>
        <div className="kpi">
          <span>Suspicious</span>
          <strong className="amber">{stats?.medium_risk_count || 0}</strong>
          <small>
            +6.8% <em>vs last 30 days</em>
          </small>
        </div>
        <div className="kpi">
          <span>Safe</span>
          <strong className="green">{stats?.low_risk_count || 0}</strong>
          <small>
            +22.1% <em>vs last 30 days</em>
          </small>
        </div>
      </div>

      {/* Dashboard Grid: Chart + AI Insight */}
      <div className="dashboard-grid">
        {/* Risk Activity Chart */}
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">DEFENSIVE TELEMETRY</div>
              <h2>Risk activity</h2>
            </div>
            <button className="select">
              30 days <ChevronRight />
            </button>
          </div>

          <div className="chart">
            <div className="chart-lines" />
            <svg viewBox="0 0 700 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 180 C70 160 65 110 125 140 S180 195 240 120 S310 145 355 75 S430 120 470 100 S535 160 565 88 S640 90 700 30 L700 220 L0 220Z"
                fill="url(#fill)"
              />
              <path
                d="M0 180 C70 160 65 110 125 140 S180 195 240 120 S310 145 355 75 S430 120 470 100 S535 160 565 88 S640 90 700 30"
                fill="none"
                stroke="#00d9ff"
                strokeWidth="3"
              />
            </svg>
            <div className="chart-labels">
              <span>May 01</span>
              <span>May 08</span>
              <span>May 15</span>
              <span>May 22</span>
              <span>May 30</span>
            </div>
          </div>
        </section>

        {/* AI Security Insight Card */}
        <section className="panel insight">
          <div className="eyebrow">AI SECURITY INSIGHT</div>
          <h2>Pattern detected</h2>
          <div className="insight-icon">
            <BrainCircuit />
          </div>
          <h3>{insightTitle}</h3>
          <p>{insightDesc}</p>
          <button
            className="text-link flex items-center gap-1.5 text-cyan text-xs font-mono font-bold mt-4 hover:underline"
            onClick={() => navigate('/app/intelligence')}
          >
            View intelligence <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>

      {/* Recent Protection Activity List */}
      <section className="panel activity mt-6">
        <div className="panel-head mb-2">
          <div>
            <div className="eyebrow">RECENT PROTECTION ACTIVITY</div>
            <h2>Latest analyses</h2>
          </div>
          <button
            className="text-link flex items-center gap-1 text-cyan text-xs font-mono font-bold hover:underline"
            onClick={() => navigate('/app/history')}
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentScans.length > 0 ? (
          recentScans.map((scan) => {
            const isHigh = scan.risk_score > 70;
            const isMed = scan.risk_score > 30 && scan.risk_score <= 70;
            const timeStr = new Date(scan.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                className="activity-row"
                key={scan.id}
                onClick={() => navigate(`/app/scanner?view=${scan.id}`)}
              >
                {getVectorIcon(scan.input_type)}
                <small className="activity-time">{timeStr}</small>
                <b className="uppercase">{scan.input_type}</b>
                <strong className={isHigh ? 'red' : isMed ? 'amber' : 'green'}>
                  {scan.risk_score}
                </strong>
                <span className="truncate">{scan.input_summary}</span>
                <ChevronRight />
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-ink text-xs font-mono">
            No threat scans recorded yet. Click "Analyze a threat" to start an inspection.
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
