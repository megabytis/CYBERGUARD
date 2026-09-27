import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieIcon, Activity, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { RollingKPI } from '@/components/ui/RollingKPI';
import { api, DashboardStats } from '@/lib/api';

const COLORS = ['#FF4D6D', '#FFBF3F', '#00FF9D', '#00D9FF'];

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-information font-mono">
        Loading telemetry metrics...
      </div>
    );
  }

  const hasData = stats && stats.total_scans > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-black font-display text-text-primary tracking-tight">
          Telemetry Analytics
        </h1>
        <p className="text-base text-text-secondary mt-1">
          Threat metrics, risk distribution breakdowns, and detection mode analytics derived from database records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RollingKPI
          title="Total Scans"
          value={stats?.total_scans || 0}
          status="information"
        />
        <RollingKPI
          title="Avg Threat Score"
          value={Math.round(stats?.average_risk_score || 0)}
          suffix="/100"
          status="suspicious"
        />
        <RollingKPI
          title="Critical Alerts"
          value={stats?.high_risk_count || 0}
          status="critical"
        />
        <RollingKPI
          title="Clean Verifications"
          value={stats?.low_risk_count || 0}
          status="protected"
        />
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Pie Chart */}
          <GlassPanel elevated className="p-6 space-y-4">
            <h2 className="text-xl font-bold font-display text-text-primary">
              Risk Tier Breakdown
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.risk_distribution}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1217',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          {/* Scanner Vectors Bar Chart */}
          <GlassPanel elevated className="p-6 space-y-4">
            <h2 className="text-xl font-bold font-display text-text-primary">
              Vector Ingestion Volume
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.scanner_distribution}>
                  <XAxis dataKey="type" stroke="#9AA6B2" tickFormatter={(v) => v.toUpperCase()} />
                  <YAxis stroke="#9AA6B2" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1217',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#00D9FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </div>
      ) : (
        <GlassPanel elevated className="p-12 text-center text-text-muted">
          No telemetry records logged yet. Run analyses in the workspace to generate charts.
        </GlassPanel>
      )}
    </div>
  );
};
