import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Clock, Plus, Trash2, X, Loader, Briefcase } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminEvents = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Event Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Workshop',
    date: '',
    time: '',
    location: '',
    description: '',
    status: 'Upcoming'
  });

  // Roster Modal State
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.type || !newEvent.date || !newEvent.time || !newEvent.location) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(newEvent)
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Event created successfully!', 'success');
        setIsModalOpen(false);
        setNewEvent({
          title: '',
          type: 'Workshop',
          date: '',
          time: '',
          location: '',
          description: '',
          status: 'Upcoming'
        });
        fetchEvents(); // Reload list
      } else {
        throw new Error(data.message || 'Failed to create event');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      if (res.ok) {
        addToast('Event deleted successfully', 'success');
        setEvents((prev) => prev.filter((evt) => evt._id !== id));
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete event');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleOpenRoster = (evt) => {
    setSelectedEvent(evt);
    setIsRosterOpen(true);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <style>{`
        .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 600px) {
          .modal-form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        .modal-overlay-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(5, 8, 18, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 1rem;
          box-sizing: border-box;
          animation: modalFadeIn 0.25s ease-out;
        }
        .modal-content-custom {
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-header-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding: 1.25rem 1.5rem;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--primary-glow), transparent);
        }
        .modal-body-custom {
          padding: 1.5rem;
          overflow-y: auto;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .modal-footer-custom {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .close-btn {
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          color: var(--text-primary);
          background: var(--bg-surface-elevated);
        }
        
        /* High Contrast Labels for Dark and Light Themes */
        .modal-content-custom label {
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          color: var(--text-secondary) !important;
          margin-bottom: 0.25rem !important;
          display: block !important;
        }
        body.light-theme .modal-content-custom label {
          color: #4b5563 !important; /* Dark slate for Light theme */
        }

        .delete-btn-card {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .delete-btn-card:hover {
          color: var(--danger);
          background-color: var(--danger-glow);
          transform: scale(1.08);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .roster-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .roster-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          border-radius: 8px;
        }
      `}</style>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Career Events</h1>
          <p style={styles.subtitle}>Manage workshops, hackathons, and placement drives for students.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Create Event
        </button>
      </header>

      {loading ? (
        <div style={styles.loaderWrap}>
          <Loader size={36} className="animate-spin" color="var(--primary)" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading career events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={styles.emptyWrap}>
          <CalendarIcon size={48} color="var(--text-muted)" />
          <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)' }}>No Career Events Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Click "Create Event" to register your first event listing.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {events.map((evt) => (
            <div key={evt._id} className="glass-card" style={styles.eventCard}>
              <div style={styles.cardHeader}>
                <span style={styles.typeBadge}>{evt.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={styles.statusBadge(evt.status)}>{evt.status}</span>
                  <button 
                    className="delete-btn-card"
                    onClick={() => handleDeleteEvent(evt._id, evt.title)}
                    title="Delete Event"
                  >
                    <Trash2 size={15} />
                  </button>
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
                  <span>{evt.registeredStudents ? evt.registeredStudents.length : 0} Registered Students</span>
                </div>
              </div>

              {evt.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                  {evt.description}
                </p>
              )}

              <div style={styles.cardActions}>
                <button 
                  className="btn btn-outline" 
                  style={{flex: 1, justifyContent: 'center'}}
                  onClick={() => handleOpenRoster(evt)}
                >
                  View Roster
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Glassmorphic Create Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '80vh' }}>
              <div className="modal-header-custom">
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>Create Career Event</h2>
                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>
              
              <div className="modal-body-custom">
                <div style={styles.formGroup}>
                  <label>Event Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google Pre-Placement Talk" 
                    required 
                    value={newEvent.title} 
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Event Type *</label>
                    <select 
                      value={newEvent.type} 
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                      className="form-select"
                    >
                      <option value="Placement Drive">Placement Drive</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label>Event Status *</label>
                    <select 
                      value={newEvent.status} 
                      onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                      className="form-select"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Registration Open">Registration Open</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Event Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={newEvent.date} 
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Event Time (Duration) *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 10:00 AM - 11:30 AM" 
                      required 
                      value={newEvent.time} 
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label>Location / Venue *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Seminar Hall B / Virtual (Zoom)" 
                    required 
                    value={newEvent.location} 
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Brief Description</label>
                  <textarea 
                    placeholder="Provide brief details about speaker, topics, or eligibility..." 
                    rows={3}
                    value={newEvent.description} 
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster Modal (List of registered students) */}
      {isRosterOpen && selectedEvent && (
        <div className="modal-overlay-custom" onClick={() => setIsRosterOpen(false)}>
          <div className="modal-content-custom" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Roster: {selectedEvent.title}
              </h2>
              <button className="close-btn" onClick={() => setIsRosterOpen(false)}>
                <X size={15} />
              </button>
            </div>
            
            <div className="modal-body-custom">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                List of registered students ({selectedEvent.registeredStudents ? selectedEvent.registeredStudents.length : 0} total)
              </p>
              
              <div className="roster-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {!selectedEvent.registeredStudents || selectedEvent.registeredStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                    <p>No students registered for this event yet.</p>
                  </div>
                ) : (
                  selectedEvent.registeredStudents.map((student, idx) => (
                    <div key={student._id || idx} className="roster-item">
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 600 }}>
                        Student
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer-custom">
              <button type="button" className="btn btn-primary" onClick={() => setIsRosterOpen(false)}>
                Done
              </button>
            </div>
          </div>
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
  statusBadge: (status) => ({
    background: status === 'Registration Open' ? 'var(--success-glow)' : 'var(--primary-glow)',
    color: status === 'Registration Open' ? 'var(--success)' : 'var(--primary)',
    padding: '0.25rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600'
  }),
  eventTitle: { fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.25rem 0' },
  detailsList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '0.85rem 1rem', borderRadius: '8px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  cardActions: { display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '0.5rem' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '6rem 0' },
  emptyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', textAlign: 'center' },
};

export default AdminEvents;
