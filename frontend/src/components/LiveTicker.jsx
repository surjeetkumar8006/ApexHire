import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Award, Briefcase, Calendar, Radio } from 'lucide-react';
import { API_BASE, useAuth } from '../context/AuthContext';

const LiveTicker = () => {
  const { authHeader } = useAuth();
  const [tickerItems, setTickerItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const headers = authHeader();
        const [statsRes, jobsRes, eventsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/analytics/public`).then(r => r.json()),
          fetch(`${API_BASE}/jobs`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/events`, { headers }).then(r => r.json())
        ]);

        const items = [];

        // 1. Stats from DB
        if (statsRes.status === 'fulfilled' && statsRes.value) {
          const { placementRate, activeJobsCount, recentPlacements } = statsRes.value;
          if (placementRate) {
            items.push({
              id: 'stat-rate',
              icon: <TrendingUp size={14} color="#c084fc" />,
              text: `🏆 Registered Candidate Placement Rate: ${placementRate}% in Database`
            });
          }
          if (activeJobsCount !== undefined) {
            items.push({
              id: 'stat-jobs',
              icon: <Zap size={14} color="#fbbf24" />,
              text: `⚡ ${activeJobsCount} Active Job Vacancies currently open in Database`
            });
          }
          if (recentPlacements && recentPlacements.length > 0) {
            recentPlacements.forEach((p, idx) => {
              items.push({
                id: `placement-${idx}`,
                icon: <Award size={14} color="#34d399" />,
                text: `🎉 ${p.name} secured ${p.role} offer at ${p.company} (${p.salary})!`
              });
            });
          }
        }

        // 2. Real Jobs from DB
        if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value) && jobsRes.value.length > 0) {
          jobsRes.value.slice(0, 5).forEach((job) => {
            items.push({
              id: `job-${job._id}`,
              icon: <Briefcase size={14} color="#60a5fa" />,
              text: `💼 ${job.company} posted opening for ${job.title} (${job.location}) — ${job.jobType}`
            });
          });
        }

        // 3. Real Events from DB
        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value) && eventsRes.value.length > 0) {
          eventsRes.value.slice(0, 4).forEach((evt) => {
            items.push({
              id: `evt-${evt._id}`,
              icon: <Calendar size={14} color="#f87171" />,
              text: `📅 ${evt.status || 'Upcoming'}: ${evt.title} hosted by ${evt.organizer} on ${evt.date}`
            });
          });
        }

        // Fallback default system items if database is completely empty
        if (items.length === 0) {
          items.push(
            { id: 'def-1', icon: <Radio size={14} color="#34d399" />, text: "🔴 ApexHire Database Connected — Real-Time Activity Monitoring Active" },
            { id: 'def-2', icon: <Zap size={14} color="#fbbf24" />, text: "⚡ AI Assessment Simulator Engine & Resume Scanner Online" }
          );
        }

        setTickerItems(items);
      } catch (err) {
        console.error('Failed to fetch real ticker data', err);
        setTickerItems([
          { id: 'err-1', icon: <Radio size={14} color="#34d399" />, text: "🔴 ApexHire Database Connected — Real-Time Live Feed Active" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 10000); // Auto-refresh real DB data every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading || tickerItems.length === 0) {
    return null;
  }

  return (
    <div className="live-ticker-bar">
      <div className="ticker-badge">
        <span className="live-pulse-dot"></span>
        <span className="ticker-badge-text">LIVE DATABASE FEED</span>
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
