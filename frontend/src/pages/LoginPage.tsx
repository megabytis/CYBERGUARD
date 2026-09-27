import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your authorized credentials.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page selection:bg-cyan-500/20 selection:text-cyan-400">
      <div className="login-glow" />

      {/* Login Top Nav */}
      <nav className="login-nav">
        <Link to="/">
          <Logo />
        </Link>
        <Link className="back-link" to="/">
          Back to website <ArrowRight />
        </Link>
      </nav>

      {/* Login Card */}
      <section className="login-card" aria-labelledby="login-title">
        <div className="eyebrow">
          <i /> SECURITY CONSOLE
        </div>
        <h1 id="login-title">Welcome back.</h1>
        <p>Sign in to access your protection center and analysis workspace.</p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Work email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="analyst@cyberguard.internal"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your authorized password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="login-meta">
            <label className="remember">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <span className="text-[11px] font-mono text-muted-ink">Argon2id Encrypted</span>
          </div>

          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              'Authenticating...'
            ) : (
              <>
                Sign in to console <ArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>Protected access</span>
        </div>

        <div className="login-security">
          <LockKeyhole />
          <span>Encrypted session · MFA ready · Zero-trust access</span>
        </div>

        <p className="login-signup">
          Authorized personnel only. <Link to="/">Return to Overview</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
