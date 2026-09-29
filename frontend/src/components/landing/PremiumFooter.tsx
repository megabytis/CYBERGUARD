import React from 'react';
import { Shield, Lock, Terminal, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassButton } from '@/components/ui/GlassButton';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-elevated p-10 sm:p-14 rounded-3xl border border-information/30 shadow-info-glow text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex p-3 rounded-2xl bg-surface-glass border border-information/40 text-information shadow-info-glow">
            <Shield className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-text-primary tracking-tight">
            Ready to Triage Potential Threats?
          </h2>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Access the defensive cybersecurity console to analyse suspicious links, emails, QR codes,
            and logs with explainable risk evidence.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/app')}
              icon={<Terminal className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-info-glow"
            >
              Launch Security Console
            </GlassButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export const PremiumFooter: React.FC = () => {
  return (
    <footer className="relative z-20 bg-background-elevated border-t border-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-surface-glass border border-information/30">
                <Shield className="w-6 h-6 text-information" />
              </div>
              <span className="text-xl font-bold font-display tracking-wider text-text-primary">
                CYBERGUARD
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
              Scan. Explain. Protect. Enterprise defensive cybersecurity intelligence platform
              providing deterministic heuristics, local machine learning, and explainable threat triage.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-protected">
              <span className="w-2 h-2 rounded-full bg-protected" />
              <span>DEFENSIVE COMPLIANCE GUARANTEE: ZERO ATTACK SIMULATION</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold font-mono text-text-primary uppercase tracking-wider mb-4">
              Defensive Console
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary font-sans">
              <li><a href="/app" className="hover:text-text-primary transition-colors">Security Console</a></li>
              <li><a href="#capabilities" className="hover:text-text-primary transition-colors">Inspection Vectors</a></li>
              <li><a href="#workflow" className="hover:text-text-primary transition-colors">Protection Workflow</a></li>
              <li><a href="#architecture" className="hover:text-text-primary transition-colors">Security Architecture</a></li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="text-sm font-bold font-mono text-text-primary uppercase tracking-wider mb-4">
              Security Governance
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary font-mono">
              <li>RFC 3986 URL Compliance</li>
              <li>RFC 5322 Email Standards</li>
              <li>OWASP Top 10 Aligned</li>
              <li>SSRF Protection Mandate</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
          <div>
            &copy; {new Date().getFullYear()} CYBERGUARD Defensive Systems. All rights reserved.
          </div>
          <div className="text-center sm:text-right">
            Controlled Demo Platform &bull; Server-Side Provisioned Accounts Only
          </div>
        </div>
      </div>
    </footer>
  );
};
