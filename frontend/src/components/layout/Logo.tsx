import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Link to="/" className={`brand cursor-pointer hover:opacity-90 transition-opacity ${className}`} title="Return to CyberGuard Main Screen">
      <div className="brand-mark">
        <ShieldCheck className="w-4 h-4 text-cyan" />
      </div>
      <div>
        <strong>
          CYBER<span>GUARD</span>
        </strong>
        <small>SCAN. EXPLAIN. PROTECT.</small>
      </div>
    </Link>
  );
};

export default Logo;
