import React from 'react';
import { Zap, TrendingUp, Award, Briefcase, Radio } from 'lucide-react';

const LiveTicker = () => {
  const tickerItems = [
    { id: 1, icon: <Award size={14} color="#34d399" />, text: "🎉 Rahul Sharma (CSE) secured SDE-1 offer at Google (28 LPA)!" },
    { id: 2, icon: <Briefcase size={14} color="#60a5fa" />, text: "💼 Microsoft added 15 new Cloud Engineer openings — Apply Now" },
    { id: 3, icon: <Zap size={14} color="#fbbf24" />, text: "⚡ 14 Real-time AI Mock Interviews and Assessments active right now" },
    { id: 4, icon: <TrendingUp size={14} color="#c084fc" />, text: "🏆 Campus Placement Rate reached 86.4% across 450+ registered candidates" },
    { id: 5, icon: <Radio size={14} color="#f87171" />, text: "🔴 Amazon AWS Hackathon & Hiring Drive opening tomorrow at 10:00 AM" },
    { id: 6, icon: <Award size={14} color="#34d399" />, text: "🎉 Priya Verma (ECE) shortlisted for Meta Product Management Interview!" }
  ];

  return (
    <div className="live-ticker-bar">
      <div className="ticker-badge">
        <span className="live-pulse-dot"></span>
        <span className="ticker-badge-text">LIVE FEED</span>
      </div>
      <div className="ticker-track-container">
        <div className="ticker-track">
          {tickerItems.concat(tickerItems).map((item, index) => (
            <div key={`${item.id}-${index}`} className="ticker-item">
              <span className="ticker-icon">{item.icon}</span>
              <span className="ticker-text">{item.text}</span>
              <span className="ticker-divider">•</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .live-ticker-bar {
          display: flex;
          align-items: center;
          background: rgba(8, 12, 22, 0.96);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 0.45rem 0.85rem;
          overflow: hidden;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .ticker-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          flex-shrink: 0;
          margin-right: 0.85rem;
          z-index: 2;
        }

        .live-pulse-dot {
          width: 7px;
          height: 7px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 8px #ef4444;
          animation: pulseGlow 1.5s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 14px #ef4444; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }

        .ticker-badge-text {
          font-size: 0.68rem;
          font-weight: 800;
          color: #f87171;
          letter-spacing: 0.8px;
        }

        .ticker-track-container {
          overflow: hidden;
          white-space: nowrap;
          flex: 1;
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }

        .ticker-track {
          display: inline-flex;
          align-items: center;
          animation: scrollMarquee 35s linear infinite;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding-right: 1.5rem;
          font-size: 0.82rem;
        }

        .ticker-text {
          color: var(--text-primary);
          font-weight: 500;
        }

        .ticker-divider {
          color: rgba(255, 255, 255, 0.25);
          margin-left: 0.75rem;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default LiveTicker;
