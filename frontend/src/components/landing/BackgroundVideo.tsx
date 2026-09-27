import React, { useState, useEffect } from 'react';

export const BackgroundVideo: React.FC = () => {
  const [videoError, setVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
  }, []);

  if (videoError || reducedMotion) {
    // Graceful CSS Cyber Mesh Fallback
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        {/* Ambient Dark Mesh Background */}
        <div className="absolute inset-0 bg-[#08090C]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#00D9FF 1px, transparent 1px), radial-gradient(#00FF9D 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            backgroundPosition: '0 0, 24px 24px',
          }}
        />
        {/* Ambient Light Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-information/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-protected/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Fallback ambient grid layer */}
      <div className="absolute inset-0 bg-[#08090C]" />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 217, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />
      {/* Light orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-information/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-protected/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};

export const BottomBlurOverlay: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-10"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
        background: 'linear-gradient(to bottom, transparent, rgba(8, 9, 12, 0.8))',
      }}
    />
  );
};
