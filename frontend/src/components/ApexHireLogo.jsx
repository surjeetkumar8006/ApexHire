import React from 'react';
import logoImg from '../assets/apexhire_logo.png';

const ApexHireLogo = ({ size = 'md', showSubtext = true, subtext = 'AI CAREER ENGINE', onClick }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconWidth = isSm ? 32 : isLg ? 48 : 38;
  const iconHeight = isSm ? 32 : isLg ? 48 : 38;
  const titleSize = isSm ? '1.15rem' : isLg ? '1.75rem' : '1.35rem';
  const subtextSize = isSm ? '0.58rem' : isLg ? '0.72rem' : '0.62rem';

  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.65rem', 
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      <div 
        style={{ 
          width: `${iconWidth}px`, 
          height: `${iconHeight}px`, 
          borderRadius: '10px', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          background: '#030712',
          flexShrink: 0
        }}
      >
        <img 
          src={logoImg} 
          alt="ApexHire AI Career Engine Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span 
          style={{ 
            fontSize: titleSize, 
            fontWeight: 900, 
            color: '#ffffff', 
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Apex<span style={{ color: '#38bdf8', marginLeft: '1px' }}>Hire</span>
        </span>
        {showSubtext && (
          <span 
            style={{ 
              fontSize: subtextSize, 
              color: '#94a3b8', 
              fontWeight: 800, 
              letterSpacing: '0.7px',
              marginTop: '2px',
              textTransform: 'uppercase'
            }}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default ApexHireLogo;
