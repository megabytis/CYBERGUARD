import React, { useState, useEffect } from 'react';
import { Settings, Save, Sparkles, Sliders, Eye, Check } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { api, UserPreferences } from '@/lib/api';

export const SettingsPage: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences>({
    enable_groq_ai: true,
    groq_model: 'llama-3.3-70b-versatile',
    heuristic_weight: 0.70,
    ml_weight: 0.30,
    reduced_motion: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getPreferences();
        setPrefs(data);
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await api.updatePreferences(prefs);
      setPrefs(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWeightChange = (newHeuristic: number) => {
    const clampedH = Math.max(0.1, Math.min(0.9, newHeuristic));
    const clampedM = Math.round((1 - clampedH) * 100) / 100;
    setPrefs((prev) => ({
      ...prev,
      heuristic_weight: Math.round(clampedH * 100) / 100,
      ml_weight: clampedM,
    }));
  };

  return (
    <div className="dashboard animate-in fade-in duration-200">
      <header className="page-head">
        <div>
          <div className="eyebrow">CONSOLE CONFIGURATION</div>
          <h1>Settings</h1>
          <p>Manage protection defaults, notifications, and analyst preferences.</p>
        </div>
        <button
          className="button primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 mr-1.5" /> Changes saved
            </>
          ) : isSaving ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" /> Save changes
            </>
          )}
        </button>
      </header>

      <form onSubmit={handleSave}>
        <div className="settings-grid">
          {/* Section 1: Protection & Groq AI Engine */}
          <section className="panel settings-card">
            <div className="eyebrow">PROTECTION</div>
            <h2>Analysis preferences</h2>

            <label>
              <span>Automatic threat analysis</span>
              <input type="checkbox" defaultChecked />
            </label>

            <label>
              <span>High-risk instant notifications</span>
              <input type="checkbox" defaultChecked />
            </label>

            <label>
              <div>
                <span>Enable Server-Side AI Explanations</span>
                <small style={{ display: 'block', color: '#718590', fontSize: '11px', marginTop: '2px' }}>
                  Automated AI narrative synthesis
                </small>
              </div>
              <input
                type="checkbox"
                checked={prefs.enable_groq_ai}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, enable_groq_ai: e.target.checked }))
                }
              />
            </label>

            <div style={{ marginTop: '8px' }}>
              <span className="text-xs font-mono text-[#718590] uppercase block mb-1.5">
                Neural Analysis Profile
              </span>
              <select
                value={prefs.groq_model}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, groq_model: e.target.value }))
                }
                disabled={!prefs.enable_groq_ai}
                className="text-input"
                style={{ width: '100%', height: '42px', fontSize: '12px', borderRadius: '6px' }}
              >
                <option value="llama-3.3-70b-versatile">High-Precision Neural Analysis (Recommended)</option>
                <option value="llama-3.1-8b-instant">Ultra-Low Latency Mode</option>
                <option value="mixtral-8x7b-32768">Balanced Enterprise Profile</option>
              </select>
            </div>
          </section>

          {/* Section 2: Hybrid Detection Scoring */}
          <section className="panel settings-card">
            <div className="eyebrow">DETECTION ENGINE</div>
            <h2>Hybrid scoring weights</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'JetBrains Mono' }}>
              <span>
                Deterministic: <strong className="green">{Math.round(prefs.heuristic_weight * 100)}%</strong>
              </span>
              <span>
                ML Model: <strong className="cyan">{Math.round(prefs.ml_weight * 100)}%</strong>
              </span>
            </div>

            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={prefs.heuristic_weight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cyan)', cursor: 'pointer', margin: '8px 0' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#718590', fontFamily: 'JetBrains Mono' }}>
              <span>Rules Driven (Heuristic)</span>
              <span>Balanced (70/30)</span>
              <span>ML Predictive</span>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '12px' }}>
              <div className="eyebrow" style={{ marginBottom: '8px' }}>ZERO-SSRF AIR-GAP</div>
              <p style={{ color: '#82959e', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                Inspection requests enforce zero-SSRF containment. Private RFC-1918 subnets and cloud metadata IPs (169.254.169.254) are quarantined unconditionally.
              </p>
            </div>
          </section>

          {/* Section 3: Analyst Workspace Profile */}
          <section className="panel settings-card">
            <div className="eyebrow">PROFILE</div>
            <h2>Analyst workspace</h2>

            <div>
              <span className="text-xs font-mono text-[#718590] uppercase block mb-1">
                Display Name
              </span>
              <input className="text-input" defaultValue="Alex Kim" />
            </div>

            <div>
              <span className="text-xs font-mono text-[#718590] uppercase block mb-1">
                Security Role
              </span>
              <input className="text-input" defaultValue="Principal Security Analyst" />
            </div>

            <div>
              <span className="text-xs font-mono text-[#718590] uppercase block mb-1">
                SOC Clearance Level
              </span>
              <input className="text-input" defaultValue="Level 3 · Full Forensics" readOnly style={{ opacity: 0.7 }} />
            </div>
          </section>

          {/* Section 4: Presentation & Accessibility */}
          <section className="panel settings-card">
            <div className="eyebrow">PRESENTATION</div>
            <h2>Display & Projector</h2>

            <label>
              <div>
                <span>Enforce Reduced Motion</span>
                <small style={{ display: 'block', color: '#718590', fontSize: '11px', marginTop: '2px' }}>
                  Optimized for conference projectors
                </small>
              </div>
              <input
                type="checkbox"
                checked={prefs.reduced_motion}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, reduced_motion: e.target.checked }))
                }
              />
            </label>

            <label>
              <span>High-contrast indicator badges</span>
              <input type="checkbox" defaultChecked />
            </label>

            <label>
              <span>Persistent audit telemetry stream</span>
              <input type="checkbox" defaultChecked />
            </label>
          </section>
        </div>
      </form>
    </div>
  );
};

