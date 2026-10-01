import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  LockKeyhole,
  Play,
  Radio,
  Scan,
  ShieldAlert,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import Radar from '@/components/ui/Radar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

interface TrackingTarget {
  id: string;
  type: 'critical' | 'warning' | 'safe' | 'inspecting';
  severity: 'HIGH' | 'NORMAL';
  angle: number; // Azimuth angle in degrees (0 to 360)
  x: number;     // Left percentage on radar circle
  y: number;     // Top percentage on radar circle
  badge: string;
  title: string;
  detail: string;
  vector: string;
  action: string;
  callout: {
    positionClass: string;
    style: React.CSSProperties;
    linePath: string;
    startDot: { x: number; y: number };
    endDot: { x: number; y: number };
  };
}

const SWEEP_DURATION_MS = 6283; // 2 * PI seconds = 1 full shader revolution at speed 1.0
const ROTATION_INTERVAL_MS = 3100; // Cycles every 3.1s (between 3-3.2s)

// Exactly 5 distinct targets with distinct fixed positions around the radar circle (recalibrated for 500px scope)
const RADAR_TRACKS: TrackingTarget[] = [
  {
    id: 'TRK-01',
    type: 'critical',
    severity: 'HIGH',
    angle: 50,
    x: 76.5,
    y: 27.8,
    badge: 'CRITICAL THREAT',
    title: 'Phishing Exploit Blocked',
    detail: 'Zero-day credential harvester payload intercepted and quarantined.',
    vector: 'email.auth.dkim',
    action: 'Quarantine Active',
    callout: {
      positionClass: 'callout-pos-tr',
      style: { top: '15px', right: '0px', width: '235px' },
      linePath: 'M 533 169 L 555 110 L 575 65',
      startDot: { x: 533, y: 169 },
      endDot: { x: 575, y: 65 }
    }
  },
  {
    id: 'TRK-02',
    type: 'warning',
    severity: 'NORMAL',
    angle: 125,
    x: 78.3,
    y: 69.8,
    badge: 'SUSPICIOUS ADVISORY',
    title: 'Homograph Domain Mismatch',
    detail: 'Punycode typo-squatting mirror attempting SSL impersonation isolated.',
    vector: 'url.heuristics',
    action: 'DNS Isolation',
    callout: {
      positionClass: 'callout-pos-br',
      style: { bottom: '25px', right: '0px', width: '235px' },
      linePath: 'M 542 379 L 560 410 L 575 440',
      startDot: { x: 542, y: 379 },
      endDot: { x: 575, y: 440 }
    }
  },
  {
    id: 'TRK-03',
    type: 'safe',
    severity: 'NORMAL',
    angle: 190,
    x: 44.0,
    y: 84.0,
    badge: 'PERIMETER VERIFIED',
    title: 'mTLS Handshake Verified',
    detail: 'Cryptographic zero-trust perimeter validated with mutual TLS 1.3.',
    vector: 'gateway.tls1.3',
    action: 'Integrity 100%',
    callout: {
      positionClass: 'callout-pos-bottom',
      style: { bottom: '-20px', left: '285px', width: '230px' },
      linePath: 'M 370 450 L 370 485 L 370 515',
      startDot: { x: 370, y: 450 },
      endDot: { x: 370, y: 515 }
    }
  },
  {
    id: 'TRK-04',
    type: 'critical',
    severity: 'HIGH',
    angle: 265,
    x: 15.8,
    y: 53.0,
    badge: 'MALICIOUS INTRUSION',
    title: 'Fake SSO Login Poisoning',
    detail: 'Unauthorized OAuth token interception and session hijacking payload neutralized.',
    vector: 'auth.oauth.token',
    action: 'Session Terminated',
    callout: {
      positionClass: 'callout-pos-left',
      style: { top: '200px', left: '0px', width: '235px' },
      linePath: 'M 229 295 L 200 295 L 170 295',
      startDot: { x: 229, y: 295 },
      endDot: { x: 170, y: 295 }
    }
  },
  {
    id: 'TRK-05',
    type: 'inspecting',
    severity: 'NORMAL',
    angle: 325,
    x: 30.3,
    y: 21.8,
    badge: 'AI VECTOR SCAN',
    title: 'Deep Neural Vector Analysis',
    detail: 'Deep behavioral evaluation executed across 7 threat parameters in 14ms.',
    vector: 'ai.ensemble.eval',
    action: 'Active Scan',
    callout: {
      positionClass: 'callout-pos-tl',
      style: { top: '15px', left: '10px', width: '235px' },
      linePath: 'M 302 139 L 260 95 L 220 65',
      startDot: { x: 302, y: 139 },
      endDot: { x: 220, y: 65 }
    }
  }
];

interface MethodStep {
  num: string;
  title: string;
  desc: string;
}

const METHOD_STEPS: MethodStep[] = [
  {
    num: '01',
    title: 'Analyze',
    desc: 'Normalize every input into a security-ready signal.'
  },
  {
    num: '02',
    title: 'Detect',
    desc: 'Combine rules, behavior, and machine learning.'
  },
  {
    num: '03',
    title: 'Explain',
    desc: 'Turn findings into a plain-language risk story.'
  },
  {
    num: '04',
    title: 'Respond',
    desc: 'Move from alert to protective action.'
  }
];

export const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Section refs for scroll triggers
  const methodSectionRef = React.useRef<HTMLElement | null>(null);
  const finalCtaRef = React.useRef<HTMLElement | null>(null);
  const [methodInView, setMethodInView] = React.useState<boolean>(false);
  const [finalCtaInView, setFinalCtaInView] = React.useState<boolean>(false);

  // Revealed tracking target IDs (starts completely empty: [])
  const [revealedIds, setRevealedIds] = React.useState<string[]>([]);
  // Active selected target ID (always stable, never null)
  const [activeTargetId, setActiveTargetId] = React.useState<string>('TRK-01');
  // Manual user lock status
  const [isUserLocked, setIsUserLocked] = React.useState<boolean>(false);

  // User expanded callout ID for reading full risk details (null by default -> NOT opened automatically)
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Toggle state to hide/show all risk alerts
  const [alertsVisible, setAlertsVisible] = React.useState<boolean>(true);

  const isUserLockedRef = React.useRef<boolean>(false);
  const userLockTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const observerOptions = { threshold: 0.18 };

    const methodObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMethodInView(true);
        methodObserver.disconnect();
      }
    }, observerOptions);

    const finalCtaObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setFinalCtaInView(true);
        finalCtaObserver.disconnect();
      }
    }, observerOptions);

    if (methodSectionRef.current) methodObserver.observe(methodSectionRef.current);
    if (finalCtaRef.current) finalCtaObserver.observe(finalCtaRef.current);

    return () => {
      methodObserver.disconnect();
      finalCtaObserver.disconnect();
    };
  }, []);



  const handleToggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
    setActiveTargetId(id);
    setIsUserLocked(true);
    isUserLockedRef.current = true;
  };

  const renderRiskSymbol = (track: TrackingTarget) => {
    if (track.severity === 'HIGH') {
      if (track.id === 'TRK-04') {
        return <ShieldAlert className="risk-symbol symbol-high" />;
      }
      return <AlertTriangle className="risk-symbol symbol-high" />;
    }
    if (track.type === 'safe') {
      return <ShieldCheck className="risk-symbol symbol-safe" />;
    }
    if (track.type === 'warning') {
      return <AlertCircle className="risk-symbol symbol-warning" />;
    }
    return <Scan className="risk-symbol symbol-inspecting" />;
  };

  // Small risk alert symbols for tracking points inside the radar scope
  const renderTrackPointSymbol = (track: TrackingTarget) => {
    if (track.severity === 'HIGH') {
      if (track.id === 'TRK-04') {
        return <ShieldAlert className="tp-symbol-icon tp-icon-high" />;
      }
      return <AlertTriangle className="tp-symbol-icon tp-icon-high" />;
    }
    if (track.type === 'safe') {
      return <ShieldCheck className="tp-symbol-icon tp-icon-safe" />;
    }
    if (track.type === 'warning') {
      return <AlertCircle className="tp-symbol-icon tp-icon-warning" />;
    }
    return <Scan className="tp-symbol-icon tp-icon-inspecting" />;
  };

  // Small Animated Icons for Method Steps (Minimal, no excessive glow)
  const renderMethodStepIcon = (stepNum: string) => {
    switch (stepNum) {
      case '01':
        // Analyze: Scanning line moves across a document icon
        return (
          <div className="step-icon-box step-icon-analyze" title="Analyze: Document Scan">
            <svg viewBox="0 0 28 28" fill="none" className="step-svg">
              <rect x="5" y="3" width="18" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
              <line x1="9" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
              <line x1="9" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
              <line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
              <line x1="4" y1="11" x2="24" y2="11" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" className="analyze-scan-laser" />
            </svg>
          </div>
        );
      case '02':
        // Detect: Small signal pulses around a shield
        return (
          <div className="step-icon-box step-icon-detect" title="Detect: Shield Signal Pulse">
            <svg viewBox="0 0 28 28" fill="none" className="step-svg">
              <circle cx="14" cy="14" r="12" stroke="var(--cyan)" strokeWidth="1.2" className="detect-pulse-wave wave-out" />
              <circle cx="14" cy="14" r="9" stroke="var(--cyan)" strokeWidth="1.2" className="detect-pulse-wave wave-mid" />
              <path d="M14 5l7 3v6c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V8l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(0, 217, 255, 0.08)" />
              <circle cx="14" cy="14" r="2" fill="var(--cyan)" />
            </svg>
          </div>
        );
      case '03':
        // Explain: Information nodes connect together
        return (
          <div className="step-icon-box step-icon-explain" title="Explain: Information Nodes">
            <svg viewBox="0 0 28 28" fill="none" className="step-svg">
              <line x1="7" y1="14" x2="14" y2="7" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="12" className="explain-node-link" />
              <line x1="14" y1="7" x2="21" y2="14" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="12" className="explain-node-link" />
              <line x1="7" y1="14" x2="14" y2="21" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="12" className="explain-node-link" />
              <line x1="14" y1="21" x2="21" y2="14" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="12" className="explain-node-link" />
              <circle cx="7" cy="14" r="2.5" fill="currentColor" />
              <circle cx="21" cy="14" r="2.5" fill="currentColor" />
              <circle cx="14" cy="7" r="3" fill="var(--cyan)" className="explain-dot-pulse" />
              <circle cx="14" cy="21" r="3" fill="var(--cyan)" className="explain-dot-pulse" />
            </svg>
          </div>
        );
      case '04':
        // Respond: Shield checkmark draws itself
        return (
          <div className="step-icon-box step-icon-respond" title="Respond: Checkmark Verification">
            <svg viewBox="0 0 28 28" fill="none" className="step-svg">
              <path d="M14 5l7 3v6c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V8l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(0, 217, 255, 0.08)" />
              <path d="M10 14l3 3 5.5-6" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="15" className="respond-check-draw" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Synchronized continuous radar rotation and progressive object reveal
  React.useEffect(() => {
    const startTime = Date.now();
    let animFrameId: number;
    const revealedSet = new Set<string>();
    let lastCycleTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const angle = ((elapsed % SWEEP_DURATION_MS) / SWEEP_DURATION_MS) * 360;

      // Check for targets crossed by the sweep needle
      RADAR_TRACKS.forEach((track) => {
        if (!revealedSet.has(track.id)) {
          if (elapsed >= SWEEP_DURATION_MS || angle >= track.angle) {
            revealedSet.add(track.id);
            setRevealedIds(Array.from(revealedSet));

            // Auto-focus newly revealed target during initial scan
            if (!isUserLockedRef.current) {
              setActiveTargetId(track.id);
              lastCycleTime = now;
            }
          }
        }
      });

      // Smoothly advance active alert every 3.1 seconds across revealed targets
      if (now - lastCycleTime > ROTATION_INTERVAL_MS && !isUserLockedRef.current) {
        lastCycleTime = now;
        setActiveTargetId((current) => {
          const revealedList = RADAR_TRACKS.filter((t) => revealedSet.has(t.id));
          if (revealedList.length === 0) return current;
          const idx = revealedList.findIndex((t) => t.id === current);
          const nextIdx = (idx + 1) % revealedList.length;
          return revealedList[nextIdx].id;
        });
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const handleSelectTarget = (id: string) => {
    setActiveTargetId(id);
    setExpandedId(id); // Clicking target blip opens its details
    setIsUserLocked(true);
    isUserLockedRef.current = true;

    if (userLockTimerRef.current) clearTimeout(userLockTimerRef.current);
    // Hold user lock for 12 seconds of reading, then resume gentle 3.1s auto-cycling
    userLockTimerRef.current = setTimeout(() => {
      setIsUserLocked(false);
      isUserLockedRef.current = false;
    }, 12000);
  };

  const handleResumeAutoScan = () => {
    if (userLockTimerRef.current) clearTimeout(userLockTimerRef.current);
    setIsUserLocked(false);
    isUserLockedRef.current = false;
  };

  const currentTarget = RADAR_TRACKS.find((t) => t.id === activeTargetId) || RADAR_TRACKS[0];
  const hasRevealedAny = revealedIds.length > 0;

  return (
    <main className="landing selection:bg-cyan-500/20 selection:text-cyan-400">
      {/* Navigation */}
      <nav className="relative z-50 !max-w-full !px-6 lg:!px-12">
        <Logo />
        <div className="links">
          <a href="#how">How it works</a>
          <a href="#reports">Reports</a>
        </div>
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <ThemeToggle />
        </div>
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
              <Play /> Explore protection
            </a>
          </div>
          <div className="trust">
            <LockKeyhole /> Built for confident security decisions <span>•</span> Explainable by design
          </div>
        </div>

        {/* Hero Visual Radar System with Dynamic High-Tech HUD Callouts */}
        <div className="hero-radar-container">
          <div className="radar-stage">
            {/* SVG Animated Leader Lines Layer */}
            <svg
              className="radar-leader-svg"
              viewBox="0 0 800 560"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {RADAR_TRACKS.map((track) => {
                const isRevealed = revealedIds.includes(track.id);
                const isActive = activeTargetId === track.id;
                if (!alertsVisible || !isRevealed || !isActive) return null;

                const isHighRisk = track.severity === 'HIGH';
                const strokeColor = isLight
                  ? isHighRisk ? '#dc2626' : track.type === 'warning' ? '#ea580c' : '#059669'
                  : isHighRisk ? '#ff334b' : track.type === 'warning' ? '#ff9900' : track.type === 'safe' ? '#00ffaa' : '#00d9ff';

                return (
                  <g key={`leader-${track.id}`} className="leader-line-group">
                    {/* Glowing Start Node on detection point */}
                    <circle
                      cx={track.callout.startDot.x}
                      cy={track.callout.startDot.y}
                      r="4"
                      className="leader-node-start"
                      fill={strokeColor}
                    />
                    {/* Animated connecting vector line */}
                    <path
                      d={track.callout.linePath}
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeDasharray="260"
                      strokeDashoffset="0"
                      className="radar-leader-path"
                    />
                    {/* Destination Anchor Node at Callout Card */}
                    <circle
                      cx={track.callout.endDot.x}
                      cy={track.callout.endDot.y}
                      r="3.5"
                      className="leader-node-end"
                      fill={strokeColor}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Seamless Radar Scope - Enlarged with User-Specified Configuration */}
            <div className="radar-wrapper">
              <Radar
                speed={1.0}
                scale={0.5}
                ringCount={10}
                spokeCount={10}
                ringThickness={0.05}
                spokeThickness={0.01}
                sweepSpeed={1.0}
                sweepWidth={2.0}
                sweepLobes={1}
                color={isLight ? '#059669' : '#33E1FF'}
                backgroundColor={isLight ? '#f8f9fa' : '#08090C'}
                falloff={2.0}
                brightness={1.0}
                enableMouseInteraction={true}
                mouseInfluence={0.1}
                lightMode={isLight}
              />

              {/* Centered Cyber Shield Emblem - Stationed in the exact center */}
              <div className="radar-center-target" title="CyberGuard Defense Core">
                <ShieldCheck />
              </div>

              {/* Tracking Points on the Radar Scope - Small Risk Alert Symbols that pop up */}
              <div className="radar-tracking-layer">
                {RADAR_TRACKS.map((track) => {
                  const isRevealed = revealedIds.includes(track.id);
                  const isSelected = activeTargetId === track.id;

                  if (!isRevealed) {
                    return null; // Stays 100% hidden until sweep needle reaches it!
                  }

                  return (
                    <button
                      key={track.id}
                      type="button"
                      className={`tracking-point tp-${track.type} severity-${track.severity.toLowerCase()} ${
                        isSelected ? 'active-target' : ''
                      } revealed-blip`}
                      style={{ left: `${track.x}%`, top: `${track.y}%` }}
                      onClick={() => handleSelectTarget(track.id)}
                      title={`${track.badge}: ${track.title} (Click to open details)`}
                      aria-label={`Target ${track.id}: ${track.title}`}
                    >
                      <span className="tp-pulse" />
                      <span className="tp-reticle" />
                      <span className="tp-symbol-badge">
                        {renderTrackPointSymbol(track)}
                      </span>
                      <span className="tp-tag">{track.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Fixed-Position HUD Alert Popups at Different Locations Around Radar */}
            {RADAR_TRACKS.map((track) => {
              const isRevealed = revealedIds.includes(track.id);
              const isActive = activeTargetId === track.id;
              if (!alertsVisible || !isRevealed || !isActive) return null;

              const isHighRisk = track.severity === 'HIGH';
              const isExpanded = expandedId === track.id;

              return (
                <div
                  key={`callout-${track.id}`}
                  className={`hud-alert-callout ${track.callout.positionClass} ${
                    isHighRisk ? 'risk-high prominent-popup' : 'risk-normal subtle-popup'
                  } alert-${track.type} ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                  style={track.callout.style}
                  onClick={(e) => handleToggleExpand(track.id, e)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  {/* Cyber Reticle Corner Brackets instead of regular box borders */}
                  <span className="corner-bracket cb-tl" />
                  <span className="corner-bracket cb-tr" />
                  <span className="corner-bracket cb-bl" />
                  <span className="corner-bracket cb-br" />

                  {/* Header Row */}
                  <div className="callout-header">
                    <div className={`risk-pill-${isHighRisk ? 'high' : 'normal'} pill-${track.type}`}>
                      <div className="risk-icon-beacon">
                        {renderRiskSymbol(track)}
                        <span className="risk-beacon-wave" />
                      </div>
                      <span className="risk-pill-text">
                        {isHighRisk ? 'HIGH RISK' : track.type === 'safe' ? 'VERIFIED' : track.type === 'warning' ? 'WARNING' : 'SCAN'}
                      </span>
                    </div>
                    <span className="callout-azimuth-tag">{track.id} · {track.angle}°</span>
                  </div>

                  {/* Title & Click-to-Expand Indicator */}
                  <div className="callout-body">
                    <h4 className="callout-title">{track.title}</h4>
                    <div className="callout-expand-trigger">
                      <span className="expand-trigger-text">
                        {isExpanded ? 'Hide details' : 'Click for details'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 inline" /> : <ChevronDown className="w-3.5 h-3.5 inline" />}
                    </div>
                  </div>

                  {/* Risk Details - NOT OPENED AUTOMATICALLY (Only appears when clicked) */}
                  {isExpanded && (
                    <div
                      className="callout-expanded-details animate-in fade-in duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="callout-desc">{track.detail}</p>

                      {/* Telemetry Vector & Protocol */}
                      <div className="callout-telemetry">
                        <div className="telemetry-item">
                          <span className="telemetry-label">VECTOR</span>
                          <code className="telemetry-val">{track.vector}</code>
                        </div>
                        <div className="telemetry-item">
                          <span className="telemetry-label">ACTION</span>
                          <span className="telemetry-action">{track.action}</span>
                        </div>
                      </div>

                      {/* Prominent High-Risk Threat Containment Strobe */}
                      {isHighRisk && (
                        <div className="callout-danger-banner">
                          <AlertTriangle className="danger-banner-icon" />
                          <span>CRITICAL THREAT CONTAINMENT ACTIVE</span>
                        </div>
                      )}

                      <div className="callout-action-row">
                        <button
                          type="button"
                          className="callout-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(null);
                          }}
                        >
                          <X className="w-3 h-3 inline mr-1" /> Close Details
                        </button>

                        {isUserLocked && (
                          <button
                            type="button"
                            className="callout-resume-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResumeAutoScan();
                            }}
                            title="Resume auto-following radar sweep"
                          >
                            <Radio className="w-3 h-3 inline mr-1" /> Resume Scan
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Radar Bottom Controls: LIVE RADAR PROTECTION LAYER with compact Alerts On/Off toggle below */}
            <div className="radar-bottom-header">
              <div className="radar-protection-label">
                <span className="live-dot" />
                LIVE RADAR PROTECTION LAYER
              </div>
              <button
                type="button"
                className={`radar-alerts-toggle-compact ${alertsVisible ? 'alerts-active' : 'alerts-hidden'}`}
                onClick={() => setAlertsVisible((v) => !v)}
                title={alertsVisible ? "Click to hide all risk alerts" : "Click to show all risk alerts"}
                aria-label={alertsVisible ? "Hide risk alerts" : "Show risk alerts"}
              >
                {alertsVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{alertsVisible ? 'ALERTS ON' : 'ALERTS OFF'}</span>
              </button>
            </div>
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

      {/* The CyberGuard Method: Sequentially Animated Steps */}
      <section className="section method-section" id="how" ref={methodSectionRef}>
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

        <div className="method-pipeline-wrapper">
          {/* Thin cyan line drawing between the cards from left to right */}
          <div className={`method-pipeline-line ${methodInView ? 'pipeline-drawn' : ''}`} />

          <div className="method-grid">
            {METHOD_STEPS.map((step, idx) => (
              <div
                key={step.num}
                className={`method-step-card ${methodInView ? 'card-entered' : ''}`}
                style={{ transitionDelay: `${idx * 140}ms` }}
              >
                <div className="step-card-top">
                  <span className={`step-number ${methodInView ? 'number-active' : ''}`}>{step.num}</span>
                  {renderMethodStepIcon(step.num)}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                <div className="step-action">
                  <span>Explore phase</span>
                  <ArrowRight className="step-action-arrow" />
                </div>
              </div>
            ))}
          </div>

          {/* Subtle connecting line beneath cards */}
          <div className="method-bottom-line" />
        </div>
      </section>

      {/* Redesigned Final Enterprise CTA Section */}
      <section className="final-cta-section" id="reports" ref={finalCtaRef}>
        <div className="cta-grid-container">
          {/* Left Column: Heading, Supporting text, Buttons & Trust badges */}
          <div className={`cta-text-column ${finalCtaInView ? 'cta-in-view' : ''}`}>
            <div className="eyebrow cta-eyebrow">
              <span className="eyebrow-pip" />
              PROTECTION, EXPLAINED
            </div>

            <h2 className="cta-main-heading">
              Every signal.
              <br />
              <span className="cta-highlight-cyan">One layer of protection.</span>
            </h2>

            <p className="cta-supporting-text">
              Analyze suspicious emails, URLs, messages, authentication logs, and network activity.
              Understand the risks and discover the next protective action.
            </p>

            <div className="cta-action-row">
              <Link className="cta-primary-btn" to="/app">
                <span>Launch Security Console</span>
                <ArrowRight className="cta-arrow-icon" />
              </Link>
              <a className="cta-secondary-btn" href="#how">
                <span>Explore How It Works</span>
              </a>
            </div>

            <div className="cta-trust-bar">
              <div className="trust-badge-item">
                <ShieldCheck className="trust-badge-icon" />
                <span>Deterministic Heuristics</span>
              </div>
              <span className="trust-badge-dot">•</span>
              <div className="trust-badge-item">
                <LockKeyhole className="trust-badge-icon" />
                <span>Zero Data Ingestion</span>
              </div>
              <span className="trust-badge-dot">•</span>
              <div className="trust-badge-item">
                <Zap className="trust-badge-icon" />
                <span>Sub-second Triage</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sophisticated Animated Cybersecurity Shield Visual */}
          <div className={`cta-visual-column ${finalCtaInView ? 'cta-in-view' : ''}`}>
            <div className="shield-visual-wrapper">
              <svg viewBox="0 0 400 400" className="shield-defense-svg" fill="none">
                <defs>
                  {/* Subtle radial ambient glow behind shield */}
                  <radialGradient id="ctaAmbientGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={isLight ? "0.14" : "0.20"} />
                    <stop offset="55%" stopColor="var(--cyan)" stopOpacity={isLight ? "0.04" : "0.06"} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
                  </radialGradient>

                  {/* Glass facet for central shield */}
                  <linearGradient id="shieldFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isLight ? "#ffffff" : "#0d1f2b"} stopOpacity={isLight ? "0.95" : "0.85"} />
                    <stop offset="100%" stopColor={isLight ? "#f1f5f9" : "#051119"} stopOpacity={isLight ? "0.98" : "0.95"} />
                  </linearGradient>
                </defs>

                {/* Ambient Soft Radial Backing */}
                <circle cx="200" cy="200" r="190" fill="url(#ctaAmbientGlow)" className="shield-ambient-circle" />

                {/* Subtle Concentric Signal Rings */}
                <circle cx="200" cy="200" r="170" className="concentric-signal-ring ring-outer-dashed" />
                <circle cx="200" cy="200" r="135" className="concentric-signal-ring ring-mid-solid" />
                <circle cx="200" cy="200" r="102" className="concentric-signal-ring ring-inner-dashed" />
                <circle cx="200" cy="200" r="72" className="concentric-signal-ring ring-core-perimeter" />

                {/* Expanding Signal Pulse Rings (Gentle expansion and fade) */}
                <circle cx="200" cy="200" r="70" className="pulse-signal-ring pulse-wave-1" />
                <circle cx="200" cy="200" r="70" className="pulse-signal-ring pulse-wave-2" />

                {/* Connected Fine Node Vector Rays */}
                <line x1="200" y1="200" x2="295" y2="105" className="connected-node-vector" />
                <line x1="200" y1="200" x2="105" y2="105" className="connected-node-vector" />
                <line x1="200" y1="200" x2="295" y2="295" className="connected-node-vector" />
                <line x1="200" y1="200" x2="105" y2="295" className="connected-node-vector" />

                {/* Traveling Signal Points on the Concentric Rings */}
                <g className="orbit-track-inner">
                  <circle cx="200" cy="98" r="3.5" className="traveling-signal-blip blip-active" />
                  <circle cx="200" cy="302" r="2.5" className="traveling-signal-blip blip-dim" />
                </g>

                <g className="orbit-track-outer">
                  <circle cx="335" cy="200" r="3" className="traveling-signal-blip blip-active" />
                  <circle cx="65" cy="200" r="2.5" className="traveling-signal-blip blip-dim" />
                </g>

                {/* Connected Satellite Nodes */}
                <circle cx="295" cy="105" r="4" className="satellite-node-core" />
                <circle cx="295" cy="105" r="7.5" className="satellite-node-ring" />

                <circle cx="105" cy="105" r="4" className="satellite-node-core" />
                <circle cx="105" cy="105" r="7.5" className="satellite-node-ring" />

                <circle cx="295" cy="295" r="4" className="satellite-node-core" />
                <circle cx="295" cy="295" r="7.5" className="satellite-node-ring" />

                <circle cx="105" cy="295" r="4" className="satellite-node-core" />
                <circle cx="105" cy="295" r="7.5" className="satellite-node-ring" />

                {/* Central Breathing Shield Visual */}
                <g className="central-shield-emblem">
                  {/* Subtle Shield Ambient Aura */}
                  <path
                    d="M 200 128 L 254 152 L 254 214 C 254 256 225 284 200 297 C 175 284 146 256 146 214 L 146 152 Z"
                    className="shield-aura-track"
                  />
                  {/* Shield Glass Body */}
                  <path
                    d="M 200 132 L 250 155 L 250 212 C 250 250 223 276 200 288 C 177 276 150 250 150 212 L 150 155 Z"
                    fill="url(#shieldFacetGrad)"
                    className="shield-glass-plate"
                  />
                  {/* Internal Security Verification Checkmark */}
                  <path
                    d="M 183 208 L 195 220 L 219 193"
                    className="shield-verification-check"
                  />
                  {/* Subtle Center Axis Seam Lines */}
                  <line x1="200" y1="134" x2="200" y2="286" className="shield-center-seam" />
                  <line x1="168" y1="190" x2="232" y2="190" className="shield-transverse-seam" />
                </g>
              </svg>

              {/* Floating Shield Status Badge */}
              <div className="shield-status-pill">
                <span className="status-indicator-dot" />
                <span className="status-indicator-text">DEFENSE LAYER ENGAGED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Footer: 3 distinct areas */}
      <footer className="landing-footer">
        <div className="footer-container">
          {/* LEFT: CYBERGUARD logo & "Scan. Explain. Protect." */}
          <div className="footer-brand-area">
            <Logo />
            <span className="footer-brand-motto">Scan. Explain. Protect.</span>
          </div>

          {/* CENTER: How It Works | Reports */}
          <nav className="footer-nav-links" aria-label="Landing Navigation">
            <a href="#how" className="footer-nav-item">How It Works</a>
            <span className="footer-nav-pipe">|</span>
            <a href="#reports" className="footer-nav-item">Reports</a>
          </nav>

          {/* RIGHT: Copyright & Defensive Intelligence */}
          <div className="footer-copyright-area">
            <span>© 2026 CYBERGUARD. Defensive intelligence for modern teams.</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
