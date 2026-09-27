import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  CheckSquare,
  HelpCircle,
  Cpu,
  Layers,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { AnimatedRiskGauge } from '@/components/ui/AnimatedRiskGauge';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { SpotlightCard } from '@/components/magicui/SpotlightCard';

const SAMPLE_DEMO_SCENARIOS = [
  {
    id: 'phish',
    label: 'Impersonation Email',
    type: 'EMAIL PHISHING',
    score: 87,
    level: 'HIGH RISK',
    summary:
      'Executive impersonation attack simulating CEO wire transfer authorization with divergent Reply-To routing and urgent coercion syntax.',
    evidence: [
      {
        severity: 'HIGH',
        category: 'Sender Alignment',
        finding: 'Envelope / Reply-To Domain Divergence',
        desc: 'From domain claims executive office, but Reply-To targets an unauthenticated external scam collector.',
      },
      {
        severity: 'HIGH',
        category: 'Threat Intelligence',
        finding: 'Financial Extortion Phrasing',
        desc: 'Contains high-urgency keywords demanding immediate $840k international wire transfer before cutoff.',
      },
      {
        severity: 'MEDIUM',
        category: 'Lookalike Analysis',
        finding: 'Deceptive Subdomain Structure',
        desc: 'Sender address uses multi-level hyphens mimicking internal corporate operations infrastructure.',
      },
    ],
    aiExplanation:
      'This payload represents a classic Business Email Compromise (BEC) scenario. The attacker exploits executive authority and artificial time pressure to bypass standard accounting authorizations. The SPF record fails alignment because the actual sending relay is outside authorized corporate MX hosts.',
    recommendations: [
      'Immediately isolate sender domain at mail gateway firewall',
      'Alert financial department to verify all wire authorizations out-of-band',
      'Submit RFC headers to SOC triage queue for lookalike domain takedown',
    ],
  },
  {
    id: 'url',
    label: 'Punycode Credential Link',
    type: 'URL THREAT',
    score: 92,
    level: 'HIGH RISK',
    summary:
      'Homograph brand impersonation link deploying Cyrillic lookalike characters to harvest account credentials via fake login portals.',
    evidence: [
      {
        severity: 'HIGH',
        category: 'Impersonation',
        finding: 'Punycode / IDN Homograph Detected',
        desc: 'Cyrillic "a" replaces Latin "a" in brand hostname (xn--pple-43d.com).',
      },
      {
        severity: 'HIGH',
        category: 'Structure',
        finding: 'Sensitive Credential Path Extraction',
        desc: 'Target path contains explicit login/auth token harvesting parameters over insecure channel.',
      },
      {
        severity: 'MEDIUM',
        category: 'SSRF Boundary',
        finding: 'Offline Static Inspection Verified',
        desc: 'Target host was evaluated entirely offline without opening socket connections to target IP.',
      },
    ],
    aiExplanation:
      'The target URL uses Cyrillic homograph characters that render indistinguishably from the genuine brand URL in standard browsers. The static parser extracted the punycode encoding and identified credential harvest paths without making outbound network requests.',
    recommendations: [
      'Block domain at perimeter DNS resolver and proxy filters',
      'Purge any browser cache or session cookies associated with the fake domain',
      'Issue warning bulletin to all domain users regarding lookalike logins',
    ],
  },
  {
    id: 'safe',
    label: 'Verified Corporate Notice',
    type: 'CLEAN EMAIL',
    score: 8,
    level: 'SAFE',
    summary:
      'Cryptographically verified corporate notification with matching SPF, DKIM 2048-bit signature, and standard organizational headers.',
    evidence: [
      {
        severity: 'SAFE',
        category: 'Authentication',
        finding: 'Cryptographic DKIM Validated',
        desc: 'RSA 2048-bit signature verified authentic against public key DNS record.',
      },
      {
        severity: 'SAFE',
        category: 'Sender Alignment',
        finding: 'Perfect From / Reply-To Match',
        desc: 'Envelopes match registered internal corporate organization domains without redirection.',
      },
    ],
    aiExplanation:
      'No coercive urgency, extortion tokens, or deceptive link destinations were detected. All cryptographic identity headers match the declared corporate origin.',
    recommendations: [
      'No containment required; permit delivery to user inbox',
      'Maintain standard organizational spam filtering baseline',
    ],
  },
];

export const ExplainableSecurityShowcase: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState(SAMPLE_DEMO_SCENARIOS[0]);

  const isHighRisk = activeScenario.score >= 70;
  const isSafe = activeScenario.score < 30;

  return (
    <section className="py-24 relative z-20 bg-background/80 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-sm font-mono text-information tracking-widest uppercase font-semibold">
            TRANSPARENT DEFENSIVE INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-text-primary tracking-tight">
            Explainable Security Architecture
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            CYBERGUARD eliminates "black-box" risk scoring. Every verdict presents the exact evidence,
            rule firings, and grounded AI reasoning that produced the score.
          </p>

          {/* Interactive Scenario Switcher */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {SAMPLE_DEMO_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenario(sc)}
                className={`px-4 py-2 rounded-xl text-sm font-mono font-bold transition-all cursor-pointer ${
                  activeScenario.id === sc.id
                    ? 'bg-information/20 border border-information/50 text-information shadow-info-glow'
                    : 'bg-surface-glass border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Explainable Security Visual Centerpiece */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Massive Risk Score & Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <GlassPanel
              elevated
              className="p-8 text-center border-border-bright relative overflow-hidden"
              borderGlow={isHighRisk ? 'critical' : isSafe ? 'protected' : 'suspicious'}
            >
              <BorderBeam
                size={260}
                duration={12}
                colorFrom={isHighRisk ? '#FF465A' : '#00FF9D'}
                colorTo={isHighRisk ? '#FF758F' : '#00D9FF'}
              />

              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted">
                  EXPLAINABLE RISK SCORE
                </span>
              </div>

              <div className="flex flex-col items-center justify-center my-2">
                <div className="scale-110 mb-2">
                  <AnimatedRiskGauge score={activeScenario.score} />
                </div>

                <div className="mt-4">
                  <GlassBadge
                    variant={isHighRisk ? 'critical' : isSafe ? 'protected' : 'suspicious'}
                    size="lg"
                    dot
                    className="text-lg font-black font-mono px-5 py-2 tracking-wide"
                  >
                    {activeScenario.level} &bull; {activeScenario.type}
                  </GlassBadge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-border/70 text-left">
                <div className="p-3 rounded-xl bg-surface-glass border border-border">
                  <span className="block text-[11px] font-mono text-text-muted uppercase font-bold">
                    Deterministic Heuristics
                  </span>
                  <span className="text-xl font-black font-mono text-text-primary mt-0.5 block">
                    70% Weight
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-glass border border-border">
                  <span className="block text-[11px] font-mono text-text-muted uppercase font-bold">
                    Local ML Classifier
                  </span>
                  <span className="text-xl font-black font-mono text-text-primary mt-0.5 block">
                    30% Weight
                  </span>
                </div>
              </div>
            </GlassPanel>

            {/* Why Flagged Summary Card */}
            <GlassPanel elevated className="p-6 space-y-3 border-l-4 border-l-information">
              <div className="flex items-center gap-2 text-information">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base font-bold font-display uppercase tracking-wide">
                  Why CYBERGUARD Flagged This
                </h3>
              </div>
              <p className="text-sm sm:text-base text-text-primary leading-relaxed">
                {activeScenario.summary}
              </p>
            </GlassPanel>
          </div>

          {/* Right Column: Evidence, AI Intelligence & Response (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Detected Evidence List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black font-display text-text-primary flex items-center gap-2">
                  <Layers className="w-5 h-5 text-information" />
                  <span>Itemized Evidence Indicators ({activeScenario.evidence.length})</span>
                </h3>
                <span className="text-xs font-mono text-text-muted">Extracted Deterministically</span>
              </div>

              <div className="space-y-3">
                {activeScenario.evidence.map((ev, i) => (
                  <SpotlightCard key={i} className="p-4 sm:p-5 border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-text-muted uppercase">
                          {ev.category}
                        </span>
                        <h4 className="text-base font-bold text-text-primary font-display mt-0.5">
                          {ev.finding}
                        </h4>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                          {ev.desc}
                        </p>
                      </div>
                      <GlassBadge
                        variant={ev.severity === 'HIGH' ? 'critical' : 'protected'}
                        size="sm"
                      >
                        {ev.severity}
                      </GlassBadge>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </div>

            {/* AI Threat Intelligence Section */}
            <GlassPanel elevated className="p-6 space-y-3 border-border-bright">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-information" />
                  <h3 className="text-lg font-black font-display text-text-primary">
                    AI Security Intelligence
                  </h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-information/15 text-information border border-information/30">
                  Grounded LLM Synthesis
                </span>
              </div>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed bg-surface-elevated/60 p-4 rounded-xl border border-border">
                {activeScenario.aiExplanation}
              </p>
            </GlassPanel>

            {/* Recommended Protective Response */}
            <GlassPanel elevated className="p-6 space-y-4 border-protected/30">
              <div className="flex items-center gap-2 text-protected">
                <CheckSquare className="w-5 h-5" />
                <h3 className="text-lg font-black font-display">
                  Recommended Protective Response
                </h3>
              </div>

              <div className="space-y-2">
                {activeScenario.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-glass border border-border flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-protected/15 text-protected border border-protected/30 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-text-primary font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
};
