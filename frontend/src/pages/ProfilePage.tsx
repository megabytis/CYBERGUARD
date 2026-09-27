import React from 'react';
import { User as UserIcon, Shield, Building, Award, Key, LogOut } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { useAuth } from '@/context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard animate-in fade-in duration-200">
      <header className="page-head">
        <div>
          <div className="eyebrow">IDENTITY & ACCESS</div>
          <h1>Analyst Profile</h1>
          <p>
            Authorized enterprise operator identity, role permissions, and active session status.
          </p>
        </div>
        <button
          className="button ghost"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-1.5" /> End Active Session
        </button>
      </header>

      <section className="panel" style={{ padding: '32px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0,217,255,0.08)',
                border: '1px solid rgba(0,217,255,0.4)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--cyan)'
              }}
            >
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '24px', margin: 0 }}>
                  {user?.profile?.full_name || 'Alex Kim'}
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0,217,255,0.12)',
                    border: '1px solid rgba(0,217,255,0.4)',
                    color: 'var(--cyan)',
                    fontWeight: 700
                  }}
                >
                  {user?.role?.toUpperCase() || 'ANALYST'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#718590', fontFamily: 'JetBrains Mono', fontSize: '13px' }}>
                {user?.email || 'alex.kim@cyberguard.internal'}
              </p>
            </div>
          </div>

          <div className="system" style={{ margin: 0, padding: '8px 14px' }}>
            <i /> <b>ACTIVE OPERATOR</b>
          </div>
        </div>

        <div className="settings-grid" style={{ marginTop: '24px' }}>
          <div className="panel settings-card" style={{ padding: '20px' }}>
            <span className="eyebrow">ORGANIZATION</span>
            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building className="w-4 h-4 text-[var(--cyan)]" />
              <span>{user?.profile?.organization || 'Cyber Defense Operations'}</span>
            </p>
          </div>

          <div className="panel settings-card" style={{ padding: '20px' }}>
            <span className="eyebrow">ASSIGNED UNIT</span>
            <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield className="w-4 h-4 text-[var(--lime)]" />
              <span>{user?.profile?.department || 'SOC Incident Triage Unit'}</span>
            </p>
          </div>

          <div className="panel settings-card" style={{ padding: '20px' }}>
            <span className="eyebrow">AUTHENTICATION MODE</span>
            <p style={{ margin: '4px 0 0', fontSize: '14px', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key className="w-4 h-4 text-[var(--cyan)]" />
              <span>Argon2id Salted Credentials &bull; HttpOnly Cookie</span>
            </p>
          </div>

          <div className="panel settings-card" style={{ padding: '20px' }}>
            <span className="eyebrow">ACCESS CLEARANCE</span>
            <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award className="w-4 h-4 text-[var(--lime)]" />
              <span>TLP:AMBER / Restricted Analyst Privileges</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

