import React from 'react';
import {
  Globe,
  Mail,
  MessageSquare,
  QrCode,
  ShieldAlert,
  Network,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassBadge } from '@/components/ui/GlassBadge';

const capabilities = [
  {
    title: 'URL Threat Inspection',
    icon: <Globe className="w-6 h-6 text-information" />,
    badge: 'STATIC HEURISTICS',
    description:
      'Detects lookalike domains, punycode/IDN spoofing, misleading subdomains, raw IP hosts, HTTP protocol downgrades, and credential harvest paths without making outbound network connections.',
    checks: ['Punycode/IDN detection', 'Lookalike brand typosquatting', 'Zero SSRF risk (never visits target)'],
  },
  {
    title: 'Email Phishing Analyzer',
    icon: <Mail className="w-6 h-6 text-protected" />,
    badge: 'CONTENT & STRUCTURE',
    description:
      'Parses sender-receiver mismatches, artificial urgency language, credential extortion keywords, suspicious attachments, and financial wire fraud phrasing.',
    checks: ['Envelope/header mismatch', 'Extortion & urgency tokens', 'Embedded suspicious hyperlinks'],
  },
  {
    title: 'SMS / Instant Smishing',
    icon: <MessageSquare className="w-6 h-6 text-suspicious" />,
    badge: 'SOCIAL ENGINEERING',
    description:
      'Evaluates smishing tactics, fake parcel delivery alerts, bank account suspension threats, OTP/2FA interception cues, and high-risk URL shorteners.',
    checks: ['Urgent account freeze lures', 'OTP/MFA credential theft', 'Obfuscated shortlink targets'],
  },
  {
    title: 'QR Code (Quishing) Safety',
    icon: <QrCode className="w-6 h-6 text-information" />,
    badge: 'OFFLINE DECODE',
    description:
      'Safely decodes and extracts embedded payloads from QR image uploads in memory. Chained straight into heuristic inspection without triggering destination exploits.',
    checks: ['Memory-only image decoding', 'Payload sanitization', 'Zero browser auto-redirect'],
  },
  {
    title: 'Authentication Logs Triage',
    icon: <ShieldAlert className="w-6 h-6 text-critical" />,
    badge: 'ANOMALY DETECTION',
    description:
      'Scans syslog, JSON, and audit trails for brute-force password spraying, impossible travel signatures, privilege escalation anomalies, and abnormal off-hours administrative access.',
    checks: ['Brute force burst analysis', 'Impossible geographic travel', 'Privilege elevation alerts'],
  },
  {
    title: 'Network Activity Telemetry',
    icon: <Network className="w-6 h-6 text-protected" />,
    badge: 'BEHAVIORAL SIGNALS',
    description:
      'Identifies command-and-control (C2) beaconing intervals, anomalous non-standard port connections, potential DNS tunneling patterns, and asymmetric byte transfers.',
    checks: ['C2 beaconing periodicity', 'DNS query size anomalies', 'Unusual port exfiltration'],
  },
  {
    title: 'Raw RFC Email Headers',
    icon: <FileCode className="w-6 h-6 text-information" />,
    badge: 'HEADER FORENSICS',
    description:
      'Parses the complete Received hop chain, From vs. Reply-To divergences, Return-Path forgery, and explicit SPF/DKIM/DMARC authentication result flags.',
    checks: ['Received hop path tracing', 'Return-Path forgery check', 'Authentication-Results parsing'],
  },
];

export const CapabilityGrid: React.FC = () => {
  return (
    <section id="capabilities" className="py-24 relative z-20 bg-background-elevated/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-mono text-information tracking-widest uppercase font-semibold">
            DEFENSE ARSENAL
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-text-primary">
            Seven Specialized Detection Vectors
          </h2>
          <p className="text-lg text-text-secondary">
            CYBERGUARD unifies multiple security inspection disciplines into one cohesive,
            high-contrast console engineered for rapid decision making.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((cap) => (
            <GlassPanel
              key={cap.title}
              className="p-7 flex flex-col justify-between hover:border-border-bright transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-surface-glass border border-border group-hover:border-border-bright transition-colors">
                    {cap.icon}
                  </div>
                  <GlassBadge variant="neutral" size="sm">
                    {cap.badge}
                  </GlassBadge>
                </div>

                <h3 className="text-xl font-bold font-display text-text-primary mb-3">
                  {cap.title}
                </h3>

                <p className="text-base text-text-secondary leading-relaxed mb-6">
                  {cap.description}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/60">
                {cap.checks.map((chk) => (
                  <div key={chk} className="flex items-center gap-2 text-sm text-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-protected shrink-0" />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
};
