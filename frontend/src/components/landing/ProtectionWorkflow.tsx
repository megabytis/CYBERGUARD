import React from 'react';
import { motion } from 'motion/react';
import { Shield, Search, AlertOctagon, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';

const workflowSteps = [
  {
    step: '01',
    title: 'PROTECT',
    icon: <Shield className="w-6 h-6 text-protected" />,
    color: 'border-protected/40 text-protected',
    description:
      'Air-gapped safe ingestion. Zero arbitrary external URL visits or untrusted remote connections. Eliminates SSRF vectors completely.',
  },
  {
    step: '02',
    title: 'ANALYSE',
    icon: <Search className="w-6 h-6 text-information" />,
    color: 'border-information/40 text-information',
    description:
      'Normalized structural parsing across URLs, emails, SMS, QR codes, auth logs, network streams, and RFC 822 email headers.',
  },
  {
    step: '03',
    title: 'DETECT',
    icon: <AlertOctagon className="w-6 h-6 text-suspicious" />,
    color: 'border-suspicious/40 text-suspicious',
    description:
      'Hybrid scoring engine: 70% transparent deterministic security heuristics plus 30% local Scikit-Learn TF-IDF machine learning inference.',
  },
  {
    step: '04',
    title: 'EXPLAIN',
    icon: <HelpCircle className="w-6 h-6 text-information" />,
    color: 'border-information/40 text-information',
    description:
      'Demystifies indicators into plain English. Server-side CYBERGUARD AI generates evidence-grounded threat narratives with zero hallucinations.',
  },
  {
    step: '05',
    title: 'RESPOND',
    icon: <CheckCircle className="w-6 h-6 text-protected" />,
    color: 'border-protected/40 text-protected',
    description:
      'Actionable SOC playbooks, DNS block recommendations, SIEM-ready JSON/CSV export, and executive ReportLab PDF reports.',
  },
];

export const ProtectionWorkflow: React.FC = () => {
  return (
    <section id="workflow" className="py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-mono text-information tracking-widest uppercase font-semibold">
            DEFENSIVE SEQUENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-text-primary">
            The Five-Stage Defense Lifecycle
          </h2>
          <p className="text-lg text-text-secondary">
            CYBERGUARD transforms suspicious inputs into verifiable evidence and defensive
            countermeasures through a transparent, reproducible pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {workflowSteps.map((s, idx) => (
            <GlassPanel
              key={s.title}
              className="p-6 flex flex-col justify-between hover:border-border-bright transition-all duration-300 relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-text-muted/60 group-hover:text-text-muted transition-colors">
                    {s.step}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-surface-glass border ${s.color}`}>
                    {s.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold font-display text-text-primary mb-2">
                  {s.title}
                </h3>

                <p className="text-sm text-text-secondary leading-relaxed">
                  {s.description}
                </p>
              </div>

              {idx < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-text-muted">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
};
