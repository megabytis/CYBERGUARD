import React from 'react';
import { ShieldCheck, Lock, Cpu, Server, FileText, Database } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';

export const SecurityArchitecture: React.FC = () => {
  return (
    <section id="architecture" className="py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-mono text-protected tracking-widest uppercase font-semibold">
            DEFENSE-IN-DEPTH
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-text-primary">
            Built for Secure Operations
          </h2>
          <p className="text-lg text-text-secondary">
            Engineered with strict zero-trust boundaries to ensure malicious payloads cannot compromise
            the analyst, the platform, or the organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GlassPanel className="p-7 space-y-4 border-border">
            <div className="p-3 w-fit rounded-xl bg-surface-glass border border-protected/40">
              <ShieldCheck className="w-6 h-6 text-protected" />
            </div>
            <h3 className="text-xl font-bold font-display text-text-primary">
              Strict Zero-SSRF Guarantee
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              CYBERGUARD never connects to or curls untrusted target URLs or server hosts. Static
              heuristic tokenization and RFC parsing eliminate internal network probing vectors.
            </p>
          </GlassPanel>

          <GlassPanel className="p-7 space-y-4 border-border">
            <div className="p-3 w-fit rounded-xl bg-surface-glass border border-information/40">
              <Cpu className="w-6 h-6 text-information" />
            </div>
            <h3 className="text-xl font-bold font-display text-text-primary">
              Local Heuristics + ML Core
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              Detection does not rely on third-party cloud scanners. Local Scikit-Learn inference and
              deterministic rule engines operate entirely within your secure Python execution boundary.
            </p>
          </GlassPanel>

          <GlassPanel className="p-7 space-y-4 border-border">
            <div className="p-3 w-fit rounded-xl bg-surface-glass border border-suspicious/40">
              <Lock className="w-6 h-6 text-suspicious" />
            </div>
            <h3 className="text-xl font-bold font-display text-text-primary">
              Controlled Demo Provisioning
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              No public registration or exposed sign-up endpoints. Authentication relies on
              cryptographically hashed Argon2id/bcrypt server credentials and secure HttpOnly sessions.
            </p>
          </GlassPanel>

          <GlassPanel className="p-7 space-y-4 border-border">
            <div className="p-3 w-fit rounded-xl bg-surface-glass border border-information/40">
              <Server className="w-6 h-6 text-information" />
            </div>
            <h3 className="text-xl font-bold font-display text-text-primary">
              Grounded AI Explanations
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              Groq Cloud LLM integration receives only the structured evidence tokens extracted by
              the scanner. The model is strictly constrained to prevent threat hallucinations.
            </p>
          </GlassPanel>

          <GlassPanel className="p-7 space-y-4 border-border">
            <div className="p-3 w-fit rounded-xl bg-surface-glass border border-protected/40">
              <FileText className="w-6 h-6 text-protected" />
            </div>
            <h3 className="text-xl font-bold font-display text-text-primary">
              Executive PDF & SIEM Export
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              Every scan can be compiled into a server-side ReportLab PDF document or exported as
              RFC 4180 CSV / structured JSON for seamless SIEM ingestion.
            </p>
          </GlassPanel>

          <GlassPanel className="p-7 space-y-4 border-border">
            <div className="p-3 w-fit rounded-xl bg-surface-glass border border-critical/40">
              <Database className="w-6 h-6 text-critical" />
            </div>
            <h3 className="text-xl font-bold font-display text-text-primary">
              Tamper-Evident Audit Trails
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              All analyst actions, scan records, reports, and system settings modifications are
              recorded in the immutable database audit ledger.
            </p>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
};
