import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Terminal,
  Globe,
  Mail,
  MessageSquare,
  ShieldAlert,
  Network,
  QrCode,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';
import { ShieldCanvas } from '@/components/canvas/ShieldCanvas';
import { DecryptedText } from '@/components/magicui/DecryptedText';
import { BorderBeam } from '@/components/magicui/BorderBeam';
import { SpotlightCard } from '@/components/magicui/SpotlightCard';

const PROTECTS_AGAINST_VECTORS = [
  { label: 'Email Phishing', icon: <Mail className="w-4 h-4 text-protected" /> },
  { label: 'Malicious URLs', icon: <Globe className="w-4 h-4 text-information" /> },
  { label: 'SMS / Smishing', icon: <MessageSquare className="w-4 h-4 text-suspicious" /> },
  { label: 'Auth Log Anomalies', icon: <ShieldAlert className="w-4 h-4 text-critical" /> },
  { label: 'Network Flows & C2', icon: <Network className="w-4 h-4 text-protected" /> },
  { label: 'QR Quishing', icon: <QrCode className="w-4 h-4 text-information" /> },
  { label: 'Raw RFC Headers', icon: <FileCode className="w-4 h-4 text-information" /> },
];

export const CinematicHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-10 pb-16 lg:pt-18 lg:pb-24 overflow-hidden">
      {/* Background Ambient Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-information/15 via-protected/5 to-transparent blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Brand, Headline, Statement, CTAs */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated/90 border border-information/40 text-xs font-mono text-information shadow-info-glow backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-information animate-ping" />
                <span className="font-bold tracking-wider">AI-POWERED THREAT PROTECTION</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <span className="block text-2xl sm:text-3xl font-mono tracking-widest text-text-secondary uppercase">
                CYBERGUARD
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-text-primary leading-[1.08]">
                <span>Scan. Explain. </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-information via-protected to-information">
                  <DecryptedText
                    text="Protect."
                    speed={60}
                    maxIterations={10}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-information via-protected to-information"
                  />
                </span>
              </h1>
            </motion.div>

            {/* Primary Statement */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl lg:text-2xl text-text-primary font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans"
            >
              Detect phishing, impersonation, and suspicious behavior before they become incidents.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/app/scanner')}
                icon={<Terminal className="w-5 h-5 text-information" />}
                className="w-full sm:w-auto shadow-info-glow text-base font-bold px-8 py-3.5"
              >
                Analyze a Threat
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
                onClick={() => {
                  const element = document.getElementById('workflow');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                icon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto text-base font-bold px-7 py-3.5"
              >
                Explore Protection
              </GlassButton>
            </motion.div>

            {/* Policy Guarantee Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm font-mono text-text-muted"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-protected shadow-[0_0_8px_#00FF9D]" />
                <span className="text-text-secondary">Strict Zero-SSRF Policy Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-information shadow-[0_0_8px_#00D9FF]" />
                <span className="text-text-secondary">7 Defensive Disciplines</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-information shadow-[0_0_8px_#00D9FF]" />
                <span className="text-text-secondary">Offline Deterministic Core</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sophisticated Protection Visualization (3D Shield) */}
          <div className="lg:col-span-5 relative">
            <SpotlightCard className="p-6 border-border-bright shadow-2xl relative">
              <BorderBeam size={260} duration={10} colorFrom="#00D9FF" colorTo="#00FF9D" />

              {/* Console Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-critical/80" />
                  <span className="w-3 h-3 rounded-full bg-suspicious/80" />
                  <span className="w-3 h-3 rounded-full bg-protected/80" />
                  <span className="text-xs font-mono text-text-muted ml-2">cyberguard://defense-shield</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-protected/15 text-protected border border-protected/40 font-bold">
                  PROTECTION CORE ACTIVE
                </span>
              </div>

              {/* Interactive 3D Shield Canvas */}
              <div className="py-2">
                <ShieldCanvas className="h-[280px] sm:h-[300px]" />
              </div>

              {/* Defensive Architecture Summary Footer */}
              <div className="mt-3 p-4 rounded-xl bg-surface-elevated/90 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-secondary font-bold">AIR-GAPPED DEFENSIVE SHIELD</span>
                  <span className="text-protected font-bold">ISOLATED ENCLAVE</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  Target URLs, payloads, and tokens are parsed statically in memory without outbound network egress.
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* ========================================================
            BELOW HERO: PROTECTS AGAINST BAR
            ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <div className="text-center sm:text-left mb-4">
            <span className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase">
              PROTECTS AGAINST
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {PROTECTS_AGAINST_VECTORS.map((vec) => (
              <div
                key={vec.label}
                className="p-3 rounded-xl bg-surface-glass border border-border hover:border-border-bright flex items-center gap-2.5 transition-all"
              >
                <div className="p-1.5 rounded-lg bg-surface-elevated">{vec.icon}</div>
                <span className="text-xs font-mono font-bold text-text-primary">{vec.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
