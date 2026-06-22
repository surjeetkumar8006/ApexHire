import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Clock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const StudentEvents = () => {
  const { user, authHeader } = useAuth();
  const { addToast } = useNotification();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to fetch events', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading career events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId, isRegistered) => {
    setProcessingId(eventId);
    const action = isRegistered ? 'unregister' : 'register';
    
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/${action}`, {
        method: 'POST',
        headers: authHeader()
      });

      const data = await res.json();

      if (res.ok) {
        addToast(
          isRegistered 
            ? 'Successfully unregistered from this event' 
            : 'Successfully registered for this event!', 
          'success'
        );
        // Update local events list with updated event from backend
        setEvents(prev => 
          prev.map(evt => evt._id === eventId ? data : evt)
        );
      } else {
        throw new Error(data.message || `Failed to ${action} for event`);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Career Events</h1>
          <p style={styles.subtitle}>Browse and register for upcoming placement talks, hackathons, and prep workshops.</p>
        </div>
      </header>

      {loading ? (
        <div style={styles.loaderWrap}>
          <Loader size={36} className="animate-spin" color="var(--primary)" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading career events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={styles.emptyWrap}>
          <CalendarIcon size={48} color="var(--text-muted)" />
          <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)' }}>No Career Events Scheduled</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Check back later for workshops, hackathons, and placement drives.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {events.map((evt) => {
            // Check if current user is registered
            const isRegistered = evt.registeredStudents && evt.registeredStudents.some(
              (student) => (student._id || student) === user._id
            );
            
            return (
              <div key={evt._id} className="glass-card" style={styles.eventCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.typeBadge}>{evt.type}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isRegistered && (
                      <span style={styles.registeredBadge}>
                        <CheckCircle size={12} /> Registered
                      </span>
                    )}
                    <span style={styles.statusBadge(evt.status)}>{evt.status}</span>
                  </div>
                </div>
                
                <h2 style={styles.eventTitle}>{evt.title}</h2>
                
                <div style={styles.detailsList}>
                  <div style={styles.detailRow}>
                    <CalendarIcon size={15} color="var(--primary)" />
                    <span>{evt.date}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <Clock size={15} color="var(--warning)" />
                    <span>{evt.time}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <MapPin size={15} color="var(--danger)" />
                    <span>{evt.location}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <Users size={15} color="var(--success)" />
                    <span>{evt.registeredStudents ? evt.registeredStudents.length : 0} Students Registered</span>
                  </div>
                </div>

                {evt.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                    {evt.description}
                  </p>
                )}

                <div style={styles.cardActions}>
                  <button 
                    className={`btn ${isRegistered ? 'btn-outline' : 'btn-primary'}`}
                    style={{
                      flex: 1, 
                      justifyContent: 'center',
                      borderColor: isRegistered ? 'var(--danger)' : undefined,
                      color: isRegistered ? 'var(--danger)' : undefined
                    }}
                    onClick={() => handleRegister(evt._id, isRegistered)}
                    disabled={processingId === evt._id || evt.status === 'Completed'}
                  >
                    {processingId === evt._id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : evt.status === 'Completed' ? (
                      'Event Ended'
                    ) : isRegistered ? (
                      'Leave Event'
                    ) : (
                      'Register Now'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  eventCard: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' },
  registeredBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--success-glow)', color: 'var(--success)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' },
  statusBadge: (status) => ({
    background: status === 'Registration Open' ? 'var(--success-glow)' : 'var(--primary-glow)',
    color: status === 'Registration Open' ? 'var(--success)' : 'var(--primary)',
    padding: '0.25rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600'
  }),
  eventTitle: { fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.25rem 0' },
  detailsList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '0.85rem 1rem', borderRadius: '8px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  cardActions: { display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '0.5rem' },
  loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '6rem 0' },
  emptyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', textAlign: 'center' },
};

export default StudentEvents;
