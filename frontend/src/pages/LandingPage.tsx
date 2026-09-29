import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  LockKeyhole,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

export const LandingPage: React.FC<{ isAuthenticated?: boolean; onLogout?: () => void }> = ({
  isAuthenticated,
  onLogout,
}) => {
  return (
    <main className="landing selection:bg-cyan-500/20 selection:text-cyan-400">
      {/* Navigation */}
      <nav>
        <Logo />
        <div className="links">
          <a href="#how">How it works</a>
          <a href="#protection">Protection</a>
          <a href="#reports">Reports</a>
        </div>
        <Link className="nav-login" to="/app">
          Security Console <ArrowRight />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <i /> AI-POWERED CYBER THREAT PROTECTION
          </div>
          <h1>
            Scan.
            <br />
            <em>Explain.</em>
            <br />
            Protect.
          </h1>
          <p>
            Detect phishing, impersonation, and suspicious behavior before they become incidents.
          </p>
          <div className="actions">
            <Link className="button primary" to="/app/scanner">
              Analyze a threat <ArrowRight />
            </Link>
            <a className="button ghost" href="#how">
              <Play className="w-3.5 h-3.5 mr-2 inline" /> Explore protection
            </a>
          </div>
          <div className="trust">
            <LockKeyhole /> Built for confident security decisions <span>•</span> Explainable by design
          </div>
        </div>

        {/* Hero Visual Orbit Core */}
        <div className="hero-visual">
          <div className="orbit one" />
          <div className="orbit two" />
          <div className="hero-core">
            <ShieldCheck />
          </div>
          <div className="signal s1">
            <b>01 · INPUT VERIFIED</b>
            <small>email.content</small>
          </div>
          <div className="signal s2">
            <b>02 · AI ANALYSIS</b>
            <small>7 factors detected</small>
          </div>
          <div className="signal s3">
            <b>03 · PROTECTION ACTIVE</b>
            <small>response ready</small>
          </div>
          <div className="visual-caption">
            <i /> LIVE PROTECTION LAYER
          </div>
        </div>
      </section>

      {/* Marquee Vector Bar */}
      <section className="marquee">
        <span>PROTECTS AGAINST</span>
        {['Email', 'URLs', 'Messages', 'Authentication', 'Network activity', 'QR codes', 'Raw Headers'].map(
          (x) => (
            <b key={x}>{x}</b>
          )
        )}
      </section>

      {/* The CyberGuard Method */}
      <section className="section" id="how">
        <div className="section-copy">
          <div className="eyebrow">THE CYBERGUARD METHOD</div>
          <h2>
            From suspicious signal
            <br />
            to informed action.
          </h2>
          <p>
            One clear security workflow. Every finding comes with verifiable evidence and the next step you need.
          </p>
        </div>
        <div className="method-grid">
          {[
            ['01', 'Analyze', 'Normalize every input into a security-ready signal.'],
            ['02', 'Detect', 'Combine rules, behavior, and machine learning.'],
            ['03', 'Explain', 'Turn findings into a plain-language risk story.'],
            ['04', 'Respond', 'Move from alert to protective action.'],
          ].map(([n, t, d]) => (
            <div className="method" key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
              <ArrowRight />
            </div>
          ))}
        </div>
      </section>

      {/* Explainable Security Risk Showcase */}
      <section className="risk-showcase" id="protection">
        <div>
          <div className="eyebrow">EXPLAINABLE SECURITY</div>
          <h2>
            See the signal
            <br />
            behind the score.
          </h2>
          <p>
            Complex detection evidence, readable at a glance—so security teams can act with full confidence.
          </p>
          <Link className="text-link" to="/app/scanner">
            Explore analysis workspace <ArrowRight />
          </Link>
        </div>

        <div className="sample">
          <div className="sample-top">
            <span className="danger">● HIGH RISK</span>
            <small>ANALYSIS COMPLETE</small>
          </div>
          <div className="sample-main">
            <div className="risk-ring">
              <div>
                <strong>87</strong>
                <span>HIGH RISK</span>
              </div>
            </div>
            <div>
              <small>CLASSIFICATION</small>
              <h3>Phishing indicators detected</h3>
              <p>4 evidence factors require attention.</p>
            </div>
          </div>
          <div className="evidence">
            <span>
              HIGH <b>Sender</b>
              <i>Domain mismatch detected</i>
            </span>
            <span>
              HIGH <b>URL</b>
              <i>Suspicious lookalike destination</i>
            </span>
            <span>
              MED <b>Language</b>
              <i>Urgency pressure pattern</i>
            </span>
          </div>
        </div>
      </section>

      {/* Final Action Section */}
      <section className="final" id="reports">
        <div className="eyebrow">
          <i /> PROTECTION, EXPLAINED
        </div>
        <h2>
          Turn suspicious signals
          <br />
          <em>into informed action.</em>
        </h2>
        <Link className="button primary" to="/app">
          Launch security console <ArrowRight />
        </Link>
      </section>

      {/* Footer */}
      <footer>
        <Logo />
        <span>© {new Date().getFullYear()} CyberGuard. Defensive intelligence for modern teams.</span>
      </footer>
    </main>
  );
};

export default LandingPage;
