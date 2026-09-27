import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`brand ${className}`}>
      <div className="brand-mark">
        <ShieldCheck className="w-4 h-4 text-cyan" />
      </div>
      <div>
        <strong>
          CYBER<span>GUARD</span>
        </strong>
        <small>SCAN. EXPLAIN. PROTECT.</small>
      </div>
    </div>
  );
};

export default Logo;
