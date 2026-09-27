import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Does CYBERGUARD connect to or execute submitted target URLs?',
    answer:
      'Never. CYBERGUARD enforces a strict Zero-SSRF architectural policy. Submitted URLs undergo static lexical tokenization, RFC 3986 parsing, punycode decoding, and entropy inspection without sending HTTP requests or resolving outbound TCP connections.',
  },
  {
    question: 'How is the 0–100 risk score calculated?',
    answer:
      'The risk score is a hybrid composite: 70% is driven by deterministic security heuristic rules (e.g. brand typosquatting, envelope mismatches, urgent wire transfer phrasing), and 30% is evaluated by a local Scikit-Learn TF-IDF Logistic Regression classifier trained on threat indicators.',
  },
  {
    question: 'Can CYBERGUARD function in an offline or air-gapped environment?',
    answer:
      'Yes. The primary scanner heuristics, local ML classifier, scoring engine, SQLite database persistence, and ReportLab PDF generator operate 100% locally in Python without internet access. When Groq AI is unavailable, the platform automatically switches to deterministic rule-based explanations.',
  },
  {
    question: 'How are user accounts created and managed?',
    answer:
      'CYBERGUARD is a controlled enterprise cybersecurity platform. There is no public registration, sign-up link, or self-service account creation. Accounts are securely provisioned server-side via environment configuration or database seeds using Argon2id/bcrypt salted hashing.',
  },
  {
    question: 'What reports and export formats does CYBERGUARD support?',
    answer:
      'Analysts can download executive incident reports generated as high-resolution PDFs with executive summaries, risk gauges, and evidence tables. For SIEM integration (Splunk, Elastic, Sentinel), scan telemetry can be exported directly to standard CSV or JSON.',
  },
];

export const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <span className="text-sm font-mono text-information tracking-widest uppercase font-semibold">
            CLEAR ANSWERS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-text-primary">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-text-secondary">
            Key architectural details regarding detection, privacy, and defensive operations.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <GlassPanel
                key={faq.question}
                className="overflow-hidden transition-all duration-200 hover:border-border-bright"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg sm:text-xl font-bold font-display text-text-primary">
                    {faq.question}
                  </span>
                  <div
                    className={cn(
                      'p-2 rounded-xl bg-surface-glass border border-border text-text-muted transition-transform duration-200 shrink-0',
                      isOpen && 'rotate-180 text-information border-information/40'
                    )}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-base text-text-secondary leading-relaxed border-t border-border/40">
                    {faq.answer}
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
};
